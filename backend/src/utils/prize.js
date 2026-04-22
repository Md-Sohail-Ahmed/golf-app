export const getPrizeDistribution = (prizePool, rolloverJackpot = 0) => {
  const base = Number(prizePool || 0);
  const rollover = Number(rolloverJackpot || 0);

  return {
    fiveMatchPool: Number((base * 0.4 + rollover).toFixed(2)),
    fourMatchPool: Number((base * 0.35).toFixed(2)),
    threeMatchPool: Number((base * 0.25).toFixed(2))
  };
};

export const splitPrize = (poolAmount, winnersCount) => {
  if (!winnersCount) return 0;
  return Number((poolAmount / winnersCount).toFixed(2));
};
