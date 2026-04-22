import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { proofUpload } from "../middlewares/upload.middleware.js";
import { uploadWinnerProof } from "../controllers/upload.controller.js";

const router = Router();

router.use(authenticate);
router.post("/winnings/:id/proof", proofUpload.single("proof"), uploadWinnerProof);

export default router;
