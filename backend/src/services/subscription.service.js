import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { UserModel } from "../models/user.model.js";
import { NotificationModel } from "../models/notification.model.js";
import { TransactionModel } from "../models/transaction.model.js";
import { AppError } from "../utils/AppError.js";

const PLAN_CONFIG = {
  monthly: {
    priceId: env.stripeMonthlyPriceId
  },
  yearly: {
    priceId: env.stripeYearlyPriceId
  }
};

const toDateFromUnix = (value) => {
  if (!Number.isFinite(Number(value))) {
    return null;
  }

  return new Date(Number(value) * 1000);
};

const getSubscriptionPeriodDates = (stripeSubscription) => {
  const firstItem = stripeSubscription.items?.data?.[0];
  const currentPeriodStart =
    stripeSubscription.current_period_start ?? firstItem?.current_period_start ?? null;
  const currentPeriodEnd =
    stripeSubscription.current_period_end ?? firstItem?.current_period_end ?? null;

  return {
    currentPeriodStart: toDateFromUnix(currentPeriodStart),
    currentPeriodEnd: toDateFromUnix(currentPeriodEnd)
  };
};

export class SubscriptionService {
  static async createCheckoutSession(user, planType) {
    const plan = PLAN_CONFIG[planType];
    if (!plan) {
      throw new AppError("Unsupported subscription plan", 400);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: plan.priceId,
          quantity: 1
        }
      ],
      success_url: `${env.clientUrl}/dashboard/subscription?success=true`,
      cancel_url: `${env.clientUrl}/dashboard/subscription?cancelled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planType
      }
    });

    await SubscriptionModel.create({
      userId: user.id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeCheckoutSessionId: session.id,
      planType,
      status: "pending",
      amount: 0
    });

    return session;
  }

  static async handleCheckoutCompleted(session) {
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
    const amount = stripeSubscription.items.data[0]?.price?.unit_amount
      ? stripeSubscription.items.data[0].price.unit_amount / 100
      : 0;
    const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriodDates(stripeSubscription);
    const activationPayload = {
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      status: "active",
      amount,
      currency: stripeSubscription.currency || "usd",
      currentPeriodStart,
      currentPeriodEnd
    };

    let updated = await SubscriptionModel.activateByCheckoutSessionId(session.id, activationPayload);

    // In production webhooks, we may occasionally miss the pending row lookup.
    // Fall back to creating the active subscription from Checkout metadata instead of crashing.
    if (!updated) {
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType;

      if (!userId || !planType) {
        throw new AppError("Checkout session metadata is missing user or plan information", 500);
      }

      updated = await SubscriptionModel.create({
        userId,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        stripeCheckoutSessionId: session.id,
        planType,
        status: "active",
        amount,
        currency: stripeSubscription.currency || "usd",
        currentPeriodStart,
        currentPeriodEnd
      });
    }

    await UserModel.updateSubscriptionStatus(updated.user_id, "active");
    await NotificationModel.create({
      userId: updated.user_id,
      type: "subscription",
      title: "Subscription activated",
      message: `Your ${updated.plan_type} subscription is now active.`
    });

    await TransactionModel.create({
      userId: updated.user_id,
      subscriptionId: updated.id,
      charityId: null,
      type: "subscription_payment",
      amount,
      providerReference: session.payment_intent || session.id,
      status: "completed",
      metadata: session
    });

    const user = await UserModel.findById(updated.user_id);
    const charityAmount = Number(
      ((amount * Number(user?.contribution_percent || 0)) / 100).toFixed(2)
    );

    if (user?.charity_id && charityAmount > 0) {
      await TransactionModel.create({
        userId: updated.user_id,
        subscriptionId: updated.id,
        charityId: user.charity_id,
        type: "charity_contribution",
        amount: charityAmount,
        providerReference: session.id,
        status: "allocated",
        metadata: {
          contributionPercent: user.contribution_percent
        }
      });
    }

    return updated;
  }

  static async handleSubscriptionUpdated(stripeSubscription) {
    const mappedStatus = stripeSubscription.status === "active" ? "active" : "inactive";
    const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriodDates(stripeSubscription);
    const updated = await SubscriptionModel.updateByStripeSubscriptionId(stripeSubscription.id, {
      status: mappedStatus,
      currentPeriodStart,
      currentPeriodEnd
    });

    if (updated) {
      await UserModel.updateSubscriptionStatus(updated.user_id, mappedStatus);
    }

    return updated;
  }
}
