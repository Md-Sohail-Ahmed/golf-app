import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";

export class AuthService {
  static async signup(payload) {
    const existingUser = await UserModel.findByEmail(payload.email);
    if (existingUser) {
      throw new AppError("A user with that email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await UserModel.create({
      fullName: payload.fullName,
      email: payload.email,
      charityId: null,
      contributionPercent: 10,
      passwordHash
    });

    return {
      user,
      token: signToken({
        userId: user.id,
        role: user.role
      })
    };
  }

  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        charity_id: user.charity_id,
        contribution_percent: user.contribution_percent,
        subscription_status: user.subscription_status
      },
      token: signToken({
        userId: user.id,
        role: user.role
      })
    };
  }
}
