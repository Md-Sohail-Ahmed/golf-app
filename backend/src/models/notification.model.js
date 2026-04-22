import { query } from "../config/db.js";

export class NotificationModel {
  static async create({ userId, type, title, message }) {
    const { rows } = await query(
      `
        INSERT INTO notifications (user_id, type, title, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [userId, type, title, message]
    );
    return rows[0];
  }

  static async getByUserId(userId) {
    const { rows } = await query(
      `
        SELECT *
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId]
    );
    return rows;
  }

  static async markRead(id, userId) {
    const { rows } = await query(
      `
        UPDATE notifications
        SET is_read = true, read_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `,
      [id, userId]
    );
    return rows[0] || null;
  }
}
