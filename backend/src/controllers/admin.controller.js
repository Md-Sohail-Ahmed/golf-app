import { UserModel } from "../models/user.model.js";
import { WinningModel } from "../models/winning.model.js";
import { DrawService } from "../services/draw.service.js";
import { AppError } from "../utils/AppError.js";

export const getAdminOverview = async (_req, res) => {
  const [users, winnings] = await Promise.all([UserModel.listAll(), WinningModel.getAll()]);

  res.json({
    success: true,
    data: {
      users,
      winnings,
      pendingProofs: winnings.filter((item) => item.status === "pending_proof")
    }
  });
};

export const runDraw = async (req, res) => {
  const draw = await DrawService.runMonthlyDraw(req.user.id);
  res.status(201).json({
    success: true,
    data: draw
  });
};

export const listUsers = async (_req, res) => {
  const users = await UserModel.listAll();
  res.json({
    success: true,
    data: users
  });
};

export const listWinners = async (_req, res) => {
  const winnings = await WinningModel.getAll();
  res.json({
    success: true,
    data: winnings
  });
};

export const reviewWinnerProof = async (req, res) => {
  const winning = await WinningModel.findById(req.params.id);
  if (!winning) {
    throw new AppError("Winning record not found", 404);
  }

  const updated = await WinningModel.updateStatus(req.params.id, {
    status: req.body.status,
    adminNotes: req.body.adminNotes,
    reviewedBy: req.user.id
  });

  res.json({
    success: true,
    data: updated
  });
};

export const markPayout = async (req, res) => {
  const updated = await WinningModel.updatePayoutStatus(req.params.id, req.body.payoutStatus);
  if (!updated) {
    throw new AppError("Winning record not found", 404);
  }

  res.json({
    success: true,
    data: updated
  });
};
