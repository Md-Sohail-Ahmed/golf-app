import { DrawModel } from "../models/draw.model.js";
import { WinningModel } from "../models/winning.model.js";

export const getDraws = async (_req, res) => {
  const draws = await DrawModel.listAll();
  res.json({
    success: true,
    data: draws
  });
};

export const getMyWinnings = async (req, res) => {
  const winnings = await WinningModel.getByUserId(req.user.id);
  res.json({
    success: true,
    data: winnings
  });
};
