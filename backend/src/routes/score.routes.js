import { Router } from "express";
import { createScore, getScores } from "../controllers/score.controller.js";
import { authenticate, requireActiveSubscription } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createScoreSchema } from "../validators/score.validator.js";

const router = Router();

router.use(authenticate, requireActiveSubscription);
router.get("/", getScores);
router.post("/", validate(createScoreSchema), createScore);

export default router;
