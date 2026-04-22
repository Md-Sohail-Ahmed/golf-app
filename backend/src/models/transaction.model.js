import { query } from "../config/db.js";

export class TransactionModel {
  static async create(payload) {
    const { rows } = await query(
      `
        INSERT INTO transactions (
          user_id,
          subscription_id,
          charity_id,
          type,
          amount,
          currency,
          provider,
          provider_reference,
          status,
          metadata
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `,
      [
        payload.userId,
        payload.subscriptionId,
        payload.charityId,
        payload.type,
        payload.amount,
        payload.currency || "usd",
        payload.provider || "stripe",
        payload.providerReference,
        payload.status,
        payload.metadata || {}
      ]
    );
    return rows[0];
  }
}
