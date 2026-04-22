import { DrawModel } from "../models/draw.model.js";
import { ScoreModel } from "../models/score.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { WinningModel } from "../models/winning.model.js";
import { NotificationService } from "./notification.service.js";
import { AppError } from "../utils/AppError.js";
import { formatDrawMonth, getMonthWindow } from "../utils/date.js";
import { getPrizeDistribution, splitPrize } from "../utils/prize.js";

const getUniqueRandomNumbers = (count, min, max) => {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return [...numbers].sort((a, b) => a - b);
};

export class DrawService {
  static async runMonthlyDraw(executedBy = null, referenceDate = new Date()) {
    const drawMonth = formatDrawMonth(referenceDate);
    const existingDraw = await DrawModel.findByMonth(drawMonth);

    if (existingDraw) {
      throw new AppError("This month's draw has already been run", 409);
    }

    const { start, end } = getMonthWindow(referenceDate);
    const activeSubscriptions = await SubscriptionModel.listActiveInMonth(start, end);
    const eligiblePlayers = await ScoreModel.getLatestFiveForEligibleUsers();
    const latestDraw = await DrawModel.getLatest();
    const rolloverAmount = latestDraw?.unclaimed_jackpot || 0;
    const prizePool = activeSubscriptions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const drawNumbers = getUniqueRandomNumbers(5, 1, 45);
    const prizeDistribution = getPrizeDistribution(prizePool, rolloverAmount);

    const winnerCandidates = eligiblePlayers
      .map((player) => {
        const playerScores = player.scores.map(Number);
        const matchedNumbers = playerScores.filter((score) => drawNumbers.includes(score));
        const matchCount = matchedNumbers.length;

        let prizeTier = null;
        if (matchCount === 5) prizeTier = "jackpot";
        if (matchCount === 4) prizeTier = "tier_2";
        if (matchCount === 3) prizeTier = "tier_3";

        return {
          userId: player.user_id,
          matchCount,
          matchedNumbers,
          prizeTier
        };
      })
      .filter((entry) => entry.prizeTier);

    const jackpotWinners = winnerCandidates.filter((item) => item.prizeTier === "jackpot");
    const tier2Winners = winnerCandidates.filter((item) => item.prizeTier === "tier_2");
    const tier3Winners = winnerCandidates.filter((item) => item.prizeTier === "tier_3");
    const unclaimedJackpot = jackpotWinners.length ? 0 : prizeDistribution.fiveMatchPool;

    const draw = await DrawModel.create({
      drawMonth,
      drawNumbers,
      prizePool,
      rolloverAmount,
      fiveMatchPool: prizeDistribution.fiveMatchPool,
      fourMatchPool: prizeDistribution.fourMatchPool,
      threeMatchPool: prizeDistribution.threeMatchPool,
      unclaimedJackpot,
      status: "completed",
      executedBy
    });

    const winnings = [
      ...jackpotWinners.map((winner) => ({
        drawId: draw.id,
        userId: winner.userId,
        matchCount: winner.matchCount,
        prizeTier: winner.prizeTier,
        amount: splitPrize(prizeDistribution.fiveMatchPool, jackpotWinners.length),
        status: "pending_proof",
        payoutStatus: "pending",
        proofUrl: null,
        matchedNumbers: winner.matchedNumbers
      })),
      ...tier2Winners.map((winner) => ({
        drawId: draw.id,
        userId: winner.userId,
        matchCount: winner.matchCount,
        prizeTier: winner.prizeTier,
        amount: splitPrize(prizeDistribution.fourMatchPool, tier2Winners.length),
        status: "pending_proof",
        payoutStatus: "pending",
        proofUrl: null,
        matchedNumbers: winner.matchedNumbers
      })),
      ...tier3Winners.map((winner) => ({
        drawId: draw.id,
        userId: winner.userId,
        matchCount: winner.matchCount,
        prizeTier: winner.prizeTier,
        amount: splitPrize(prizeDistribution.threeMatchPool, tier3Winners.length),
        status: "pending_proof",
        payoutStatus: "pending",
        proofUrl: null,
        matchedNumbers: winner.matchedNumbers
      }))
    ];

    const createdWinnings = await WinningModel.createMany(winnings);

    await NotificationService.notifyDrawResults(draw, createdWinnings);

    return {
      ...draw,
      winners: createdWinnings
    };
  }
}
