import { Router } from "express";
import {
  getNotifications,
  markNotificationRead
} from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);

export default router;
