import { Router, Response, Request } from "express";
import {
  generateOTP,
  login,
  logout,
  refreshToken,
  verifyOTP,
} from "./controller";
import authMiddleware, { authOTPMiddleware } from "./authMiddleware";
import db from "@src/db";
import excludeProperties from "@src/utils/excludeProperties";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string };
    }
  }
}

const router = Router();

router.get("/", authMiddleware([]), async (req: Request, res: Response) => {
  const user = await db.c_user.findFirst({
    where: {
      email: req.user?.email,
    },
  });
  res.send(excludeProperties(user ?? {}, ["password"]));
});

router.post("/login", login(db));
router.post("/refresh-token", refreshToken);
router.get("/logout", logout);
router.get("/generate-otp", generateOTP(db));
router.post("/verify-otp", verifyOTP(db));

export default router;
