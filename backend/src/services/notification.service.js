import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { NotificationModel } from "../models/notification.model.js";
import { UserModel } from "../models/user.model.js";

const transporter =
  env.smtpHost && env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass
        }
      })
    : null;

export class NotificationService {
  static async sendInAppNotification(userId, payload) {
    return NotificationModel.create({
      userId,
      ...payload
    });
  }

  static async sendEmail(to, subject, text) {
    if (!transporter) return null;

    return transporter.sendMail({
      from: env.emailFrom,
      to,
      subject,
      text
    });
  }

  static async notifyDrawResults(draw, winnings) {
    const winnerIds = new Set(winnings.map((item) => item.user_id));

    for (const winning of winnings) {
      const user = await UserModel.findById(winning.user_id);
      if (!user) continue;

      const message = `You won ${winning.amount} in the ${draw.draw_month} draw. Upload your proof to continue payout verification.`;
      await this.sendInAppNotification(user.id, {
        type: "winner",
        title: "You have a winning entry",
        message
      });
      await this.sendEmail(user.email, "You have a winning entry", message);
    }

    const allUsers = await UserModel.listAll();
    for (const user of allUsers) {
      if (user.role !== "user" || winnerIds.has(user.id)) continue;
      await this.sendInAppNotification(user.id, {
        type: "draw_result",
        title: `Draw completed for ${draw.draw_month}`,
        message: "The monthly draw has been completed. Visit your dashboard to review the latest results."
      });
    }
  }
}
