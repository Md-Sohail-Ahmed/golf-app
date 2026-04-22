import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { UserModel } from "../models/user.model.js";

export const authenticate = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  const decoded = verifyToken(token);
  const user = await UserModel.findById(decoded.userId);

  if (!user) {
    return next(new AppError("User not found", 401));
  }

  req.user = user;
  next();
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to access this resource", 403));
  }

  next();
};

export const requireActiveSubscription = async (req, _res, next) => {
  if (req.user.role === "admin") {
    return next();
  }

  if (req.user.subscription_status !== "active") {
    return next(new AppError("An active subscription is required", 403));
  }

  next();
};
