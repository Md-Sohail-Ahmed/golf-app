import cron from "node-cron";
import { env } from "../config/env.js";
import { DrawService } from "../services/draw.service.js";

export const startSchedulers = () => {
  cron.schedule(env.drawScheduleCron, async () => {
    try {
      await DrawService.runMonthlyDraw(null);
      console.log("Scheduled draw executed successfully");
    } catch (error) {
      console.error("Scheduled draw skipped:", error.message);
    }
  });
};
