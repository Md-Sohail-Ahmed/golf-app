import { SubscriptionService } from "../services/subscription.service.js";
import { SubscriptionModel } from "../models/subscription.model.js";

export const createCheckoutSession = async (req, res) => {
  const session = await SubscriptionService.createCheckoutSession(req.user, req.body.planType);
  res.status(201).json({
    success: true,
    data: {
      url: session.url,
      sessionId: session.id
    }
  });
};

export const getSubscription = async (req, res) => {
  const subscription = await SubscriptionModel.findLatestByUserId(req.user.id);
  res.json({
    success: true,
    data: subscription
  });
};
