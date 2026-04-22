import { Router } from "express";
import { createCheckoutSession, getSubscription } from "../controllers/subscription.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createCheckoutSchema } from "../validators/subscription.validator.js";

const router = Router();

router.use(authenticate);
router.get("/current", getSubscription);
router.post("/checkout", validate(createCheckoutSchema), createCheckoutSession);

export default router;
