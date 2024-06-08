import authMiddleware, { authOTPMiddleware } from "./auth/authMiddleware";
import {
  generateOTP,
  login,
  logout,
  refreshToken,
  verifyOTP,
} from "./auth/controller";
import { init as initDB } from "./db";

export default {
  login,
  logout,
  refreshToken,
  generateOTP,
  verifyOTP,
  authMiddleware,
  authOTPMiddleware,
  initDB,
};
