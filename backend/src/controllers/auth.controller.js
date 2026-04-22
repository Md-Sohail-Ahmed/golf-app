import { AuthService } from "../services/auth.service.js";

export const signup = async (req, res) => {
  const result = await AuthService.signup(req.body);
  res.status(201).json({
    success: true,
    ...result
  });
};

export const login = async (req, res) => {
  const result = await AuthService.login(req.body);
  res.json({
    success: true,
    ...result
  });
};

export const logout = async (_req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
};
