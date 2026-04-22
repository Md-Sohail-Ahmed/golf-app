import Joi from "joi";

export const createScoreSchema = Joi.object({
  score: Joi.number().integer().min(1).max(45).required(),
  playedAt: Joi.date().iso().required()
});
