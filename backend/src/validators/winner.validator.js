import Joi from "joi";

export const winnerDecisionSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
  adminNotes: Joi.string().max(1000).allow("", null)
});

export const payoutStatusSchema = Joi.object({
  payoutStatus: Joi.string().valid("pending", "paid").required()
});
