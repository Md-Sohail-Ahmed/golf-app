import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { SubscriptionService } from "../services/subscription.service.js";

export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event = req.body;

  if (env.stripeWebhookSecret && signature) {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  }

  switch (event.type) {
    case "checkout.session.completed":
      await SubscriptionService.handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await SubscriptionService.handleSubscriptionUpdated(event.data.object);
      break;
    default:
      break;
  }

  res.json({ received: true });
};
