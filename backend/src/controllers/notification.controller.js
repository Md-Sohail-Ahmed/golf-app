import { NotificationModel } from "../models/notification.model.js";
import { AppError } from "../utils/AppError.js";

export const getNotifications = async (req, res) => {
  const notifications = await NotificationModel.getByUserId(req.user.id);
  res.json({
    success: true,
    data: notifications
  });
};

export const markNotificationRead = async (req, res) => {
  const notification = await NotificationModel.markRead(req.params.id, req.user.id);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  res.json({
    success: true,
    data: notification
  });
};
