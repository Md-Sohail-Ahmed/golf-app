import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getDashboard, getProfile } from "../controllers/user.controller.js";

const router = Router();

router.use(authenticate);
router.get("/me", getProfile);
router.get("/dashboard", getDashboard);

export default router;
