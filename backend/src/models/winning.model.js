import { query } from "../config/db.js";

export class WinningModel {
  static async createMany(entries) {
    if (!entries.length) return [];

    const values = [];
    const placeholders = [];

    entries.forEach((entry, index) => {
      const base = index * 9;
      placeholders.push(
        `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},$${base + 9})`
      );
      values.push(
        entry.drawId,
        entry.userId,
        entry.matchCount,
        entry.prizeTier,
        entry.amount,
        entry.status,
        entry.payoutStatus,
        entry.proofUrl,
        entry.matchedNumbers
      );
    });

    const { rows } = await query(
      `
        INSERT INTO winnings (
          draw_id,
          user_id,
          match_count,
          prize_tier,
          amount,
          status,
          payout_status,
          proof_url,
          matched_numbers
        )
        VALUES ${placeholders.join(",")}
        RETURNING *
      `,
      values
    );

    return rows;
  }

  static async getByUserId(userId) {
    const { rows } = await query(
      `
        SELECT
          w.*,
          d.draw_month,
          d.draw_numbers
        FROM winnings w
        INNER JOIN draws d ON d.id = w.draw_id
        WHERE w.user_id = $1
        ORDER BY d.draw_month DESC
      `,
      [userId]
    );
    return rows;
  }

  static async getAll() {
    const { rows } = await query(`
      SELECT
        w.*,
        u.full_name,
        u.email,
        d.draw_month
      FROM winnings w
      INNER JOIN users u ON u.id = w.user_id
      INNER JOIN draws d ON d.id = w.draw_id
      ORDER BY d.draw_month DESC, w.amount DESC
    `);
    return rows;
  }

  static async findById(id) {
    const { rows } = await query("SELECT * FROM winnings WHERE id = $1 LIMIT 1", [id]);
    return rows[0] || null;
  }

  static async updateStatus(id, payload) {
    const { rows } = await query(
      `
        UPDATE winnings
        SET
          status = $2,
          admin_notes = $3,
          reviewed_at = NOW(),
          reviewed_by = $4,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [id, payload.status, payload.adminNotes, payload.reviewedBy]
    );
    return rows[0] || null;
  }

  static async updatePayoutStatus(id, payoutStatus) {
    const { rows } = await query(
      `
        UPDATE winnings
        SET payout_status = $2, paid_at = CASE WHEN $2 = 'paid' THEN NOW() ELSE NULL END, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [id, payoutStatus]
    );
    return rows[0] || null;
  }

  static async attachProof(id, proofUrl) {
    const { rows } = await query(
      `
        UPDATE winnings
        SET proof_url = $2, status = 'pending_proof', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [id, proofUrl]
    );
    return rows[0] || null;
  }
}
