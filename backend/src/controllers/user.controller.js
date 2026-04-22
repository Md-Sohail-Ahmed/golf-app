import { UserModel } from "../models/user.model.js";
import { ScoreModel } from "../models/score.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { WinningModel } from "../models/winning.model.js";
import { NotificationModel } from "../models/notification.model.js";

export const getProfile = async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  res.json({
    success: true,
    data: user
  });
};

export const getDashboard = async (req, res) => {
  const [user, scores, subscription, winnings, notifications] = await Promise.all([
    UserModel.findById(req.user.id),
    ScoreModel.getUserScores(req.user.id),
    SubscriptionModel.findLatestByUserId(req.user.id),
    WinningModel.getByUserId(req.user.id),
    NotificationModel.getByUserId(req.user.id)
  ]);

  const totalWinnings = winnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  res.json({
    success: true,
    data: {
      user,
      subscription,
      scores,
      winnings,
      totalWinnings,
      notifications
    }
  });
};
