import { query, withTransaction } from "../config/db.js";

export class ScoreModel {
  static async addScore({ userId, score, playedAt }) {
    return withTransaction(async (client) => {
      const existing = await client.query(
        `
          SELECT id
          FROM scores
          WHERE user_id = $1 AND played_at::date = $2::date
          LIMIT 1
        `,
        [userId, playedAt]
      );

      if (existing.rows.length) {
        throw Object.assign(new Error("A score already exists for that date"), {
          statusCode: 409
        });
      }

      const currentScores = await client.query(
        `
          SELECT id
          FROM scores
          WHERE user_id = $1
          ORDER BY played_at ASC, created_at ASC
        `,
        [userId]
      );

      if (currentScores.rows.length >= 5) {
        await client.query("DELETE FROM scores WHERE id = $1", [currentScores.rows[0].id]);
      }

      const inserted = await client.query(
        `
          INSERT INTO scores (user_id, score, played_at)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
        [userId, score, playedAt]
      );

      const latest = await client.query(
        `
          SELECT *
          FROM scores
          WHERE user_id = $1
          ORDER BY played_at DESC, created_at DESC
        `,
        [userId]
      );

      return {
        created: inserted.rows[0],
        scores: latest.rows
      };
    });
  }

  static async getUserScores(userId) {
    const { rows } = await query(
      `
        SELECT *
        FROM scores
        WHERE user_id = $1
        ORDER BY played_at DESC, created_at DESC
      `,
      [userId]
    );
    return rows;
  }

  static async getLatestFiveForEligibleUsers() {
    const { rows } = await query(`
      SELECT
        u.id AS user_id,
        u.email,
        u.full_name,
        ARRAY_AGG(s.score ORDER BY s.played_at DESC, s.created_at DESC) AS scores
      FROM users u
      INNER JOIN scores s ON s.user_id = u.id
      WHERE u.subscription_status = 'active'
      GROUP BY u.id, u.email, u.full_name
      HAVING COUNT(s.id) = 5
    `);
    return rows;
  }
}
