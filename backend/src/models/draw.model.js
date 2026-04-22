import { query } from "../config/db.js";

export class DrawModel {
  static async create(payload) {
    const { rows } = await query(
      `
        INSERT INTO draws (
          draw_month,
          draw_numbers,
          prize_pool,
          rollover_amount,
          five_match_pool,
          four_match_pool,
          three_match_pool,
          unclaimed_jackpot,
          status,
          executed_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `,
      [
        payload.drawMonth,
        payload.drawNumbers,
        payload.prizePool,
        payload.rolloverAmount,
        payload.fiveMatchPool,
        payload.fourMatchPool,
        payload.threeMatchPool,
        payload.unclaimedJackpot,
        payload.status,
        payload.executedBy
      ]
    );
    return rows[0];
  }

  static async findByMonth(drawMonth) {
    const { rows } = await query("SELECT * FROM draws WHERE draw_month = $1 LIMIT 1", [drawMonth]);
    return rows[0] || null;
  }

  static async getLatest() {
    const { rows } = await query("SELECT * FROM draws ORDER BY draw_month DESC LIMIT 1");
    return rows[0] || null;
  }

  static async listAll() {
    const { rows } = await query("SELECT * FROM draws ORDER BY draw_month DESC");
    return rows;
  }
}
