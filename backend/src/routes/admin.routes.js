import { Router } from "express";
import {
  getAdminOverview,
  listUsers,
  listWinners,
  markPayout,
  reviewWinnerProof,
  runDraw
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { payoutStatusSchema, winnerDecisionSchema } from "../validators/winner.validator.js";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/overview", getAdminOverview);
router.get("/users", listUsers);
router.get("/winners", listWinners);
router.post("/draws/run", runDraw);
router.patch("/winners/:id/review", validate(winnerDecisionSchema), reviewWinnerProof);
router.patch("/winners/:id/payout", validate(payoutStatusSchema), markPayout);

export default router;
