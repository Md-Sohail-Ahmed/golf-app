import { Router } from "express";
import {
  createCharity,
  deleteCharity,
  getCharities,
  updateCharity
} from "../controllers/charity.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createCharitySchema, updateCharitySchema } from "../validators/charity.validator.js";

const router = Router();

router.get("/", getCharities);
router.post("/", authenticate, authorize("admin"), validate(createCharitySchema), createCharity);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateCharitySchema),
  updateCharity
);
router.delete("/:id", authenticate, authorize("admin"), deleteCharity);

export default router;
