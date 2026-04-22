import Joi from "joi";

export const createCheckoutSchema = Joi.object({
  planType: Joi.string().valid("monthly", "yearly").required()
});
