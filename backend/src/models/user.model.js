import { query } from "../config/db.js";

export class UserModel {
  static async create({
    fullName,
    email,
    passwordHash,
    charityId,
    contributionPercent,
    role = "user"
  }) {
    const sql = `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        charity_id,
        contribution_percent,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, email, role, charity_id, contribution_percent, subscription_status, created_at
    `;

    const { rows } = await query(sql, [
      fullName,
      email.toLowerCase(),
      passwordHash,
      charityId,
      contributionPercent,
      role
    ]);

    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await query(
      `
        SELECT *
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email.toLowerCase()]
    );

    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await query(
      `
        SELECT
          u.*,
          c.name AS charity_name
        FROM users u
        LEFT JOIN charities c ON c.id = u.charity_id
        WHERE u.id = $1
        LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  }

  static async listAll() {
    const { rows } = await query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.subscription_status,
        u.contribution_percent,
        u.created_at,
        c.name AS charity_name
      FROM users u
      LEFT JOIN charities c ON c.id = u.charity_id
      ORDER BY u.created_at DESC
    `);

    return rows;
  }

  static async updateSubscriptionStatus(userId, status) {
    const { rows } = await query(
      `
        UPDATE users
        SET subscription_status = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [userId, status]
    );

    return rows[0];
  }
}
