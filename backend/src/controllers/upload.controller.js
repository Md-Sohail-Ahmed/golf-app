import { WinningModel } from "../models/winning.model.js";
import { UploadService } from "../services/upload.service.js";
import { AppError } from "../utils/AppError.js";

export const uploadWinnerProof = async (req, res) => {
  if (!req.file) {
    throw new AppError("Proof image is required", 400);
  }

  const winning = await WinningModel.findById(req.params.id);
  if (!winning || winning.user_id !== req.user.id) {
    throw new AppError("Winning record not found", 404);
  }

  const proofUrl = await UploadService.uploadProof(req.file, req.user.id);
  const updated = await WinningModel.attachProof(req.params.id, proofUrl);

  res.status(201).json({
    success: true,
    data: updated
  });
};
