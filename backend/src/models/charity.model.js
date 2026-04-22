import { query } from "../config/db.js";

export class CharityModel {
  static async findAll(includeInactive = false) {
    const { rows } = await query(
      `
        SELECT *
        FROM charities
        WHERE ($1::boolean = true OR is_active = true)
        ORDER BY name ASC
      `,
      [includeInactive]
    );

    return rows;
  }

  static async findById(id) {
    const { rows } = await query("SELECT * FROM charities WHERE id = $1 LIMIT 1", [id]);
    return rows[0] || null;
  }

  static async create(payload) {
    const { rows } = await query(
      `
        INSERT INTO charities (name, description, website_url, logo_url, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [payload.name, payload.description, payload.websiteUrl, payload.logoUrl, payload.isActive]
    );

    return rows[0];
  }

  static async update(id, payload) {
    const { rows } = await query(
      `
        UPDATE charities
        SET
          name = $2,
          description = $3,
          website_url = $4,
          logo_url = $5,
          is_active = $6,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [id, payload.name, payload.description, payload.websiteUrl, payload.logoUrl, payload.isActive]
    );

    return rows[0] || null;
  }

  static async remove(id) {
    await query("DELETE FROM charities WHERE id = $1", [id]);
  }
}
