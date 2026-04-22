import { query } from "../config/db.js";

export class SubscriptionModel {
  static async create({
    userId,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCheckoutSessionId,
    planType,
    status = "pending",
    amount,
    currency = "usd",
    currentPeriodStart = null,
    currentPeriodEnd = null
  }) {
    const { rows } = await query(
      `
        INSERT INTO subscriptions (
          user_id,
          stripe_customer_id,
          stripe_subscription_id,
          stripe_checkout_session_id,
          plan_type,
          status,
          amount,
          currency,
          current_period_start,
          current_period_end
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `,
      [
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        stripeCheckoutSessionId,
        planType,
        status,
        amount,
        currency,
        currentPeriodStart,
        currentPeriodEnd
      ]
    );

    return rows[0];
  }

  static async findLatestByUserId(userId) {
    const { rows } = await query(
      `
        SELECT *
        FROM subscriptions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [userId]
    );

    return rows[0] || null;
  }

  static async findByCheckoutSessionId(sessionId) {
    const { rows } = await query(
      "SELECT * FROM subscriptions WHERE stripe_checkout_session_id = $1 LIMIT 1",
      [sessionId]
    );
    return rows[0] || null;
  }

  static async updateByStripeSubscriptionId(stripeSubscriptionId, payload) {
    const { rows } = await query(
      `
        UPDATE subscriptions
        SET
          status = $2,
          current_period_start = $3,
          current_period_end = $4,
          updated_at = NOW()
        WHERE stripe_subscription_id = $1
        RETURNING *
      `,
      [
        stripeSubscriptionId,
        payload.status,
        payload.currentPeriodStart,
        payload.currentPeriodEnd
      ]
    );

    return rows[0] || null;
  }

  static async activateByCheckoutSessionId(sessionId, payload) {
    const { rows } = await query(
      `
        UPDATE subscriptions
        SET
          stripe_customer_id = $2,
          stripe_subscription_id = $3,
          status = $4,
          amount = $5,
          currency = $6,
          current_period_start = $7,
          current_period_end = $8,
          updated_at = NOW()
        WHERE stripe_checkout_session_id = $1
        RETURNING *
      `,
      [
        sessionId,
        payload.stripeCustomerId,
        payload.stripeSubscriptionId,
        payload.status,
        payload.amount,
        payload.currency,
        payload.currentPeriodStart,
        payload.currentPeriodEnd
      ]
    );

    return rows[0] || null;
  }

  static async listActiveInMonth(startDate, endDate) {
    const { rows } = await query(
      `
        SELECT *
        FROM subscriptions
        WHERE status = 'active'
          AND current_period_start < $2
          AND current_period_end >= $1
      `,
      [startDate, endDate]
    );
    return rows;
  }
}
