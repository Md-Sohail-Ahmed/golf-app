import { Router } from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { loginSchema, signupSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

export default router;
