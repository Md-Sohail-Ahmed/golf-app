import { Router } from "express";
import { getDraws, getMyWinnings } from "../controllers/draw.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getDraws);
router.get("/my-winnings", getMyWinnings);

export default router;
