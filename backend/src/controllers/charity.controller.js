import { CharityModel } from "../models/charity.model.js";
import { AppError } from "../utils/AppError.js";

export const getCharities = async (req, res) => {
  const charities = await CharityModel.findAll(req.user?.role === "admin");
  res.json({
    success: true,
    data: charities
  });
};

export const createCharity = async (req, res) => {
  const charity = await CharityModel.create(req.body);
  res.status(201).json({
    success: true,
    data: charity
  });
};

export const updateCharity = async (req, res) => {
  const charity = await CharityModel.update(req.params.id, req.body);
  if (!charity) {
    throw new AppError("Charity not found", 404);
  }

  res.json({
    success: true,
    data: charity
  });
};

export const deleteCharity = async (req, res) => {
  await CharityModel.remove(req.params.id);
  res.json({
    success: true,
    message: "Charity deleted successfully"
  });
};
