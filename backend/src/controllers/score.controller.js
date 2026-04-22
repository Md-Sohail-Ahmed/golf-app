import { ScoreModel } from "../models/score.model.js";

export const createScore = async (req, res) => {
  const result = await ScoreModel.addScore({
    userId: req.user.id,
    score: req.body.score,
    playedAt: req.body.playedAt
  });

  res.status(201).json({
    success: true,
    data: result
  });
};

export const getScores = async (req, res) => {
  const scores = await ScoreModel.getUserScores(req.user.id);
  res.json({
    success: true,
    data: scores
  });
};
