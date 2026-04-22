import Joi from "joi";

export const createCharitySchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(1000).allow("", null),
  websiteUrl: Joi.string().uri().allow("", null),
  logoUrl: Joi.string().uri().allow("", null),
  isActive: Joi.boolean().default(true)
});

export const updateCharitySchema = createCharitySchema;
