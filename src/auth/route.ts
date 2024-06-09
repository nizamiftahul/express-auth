import { Router, Response, Request } from "express";
import {
  activateUser,
  createUser,
  deleteUser,
  forgotPassword,
  generateOTP,
  login,
  logout,
  refreshToken,
  resetPassword,
  updatePassword,
  verifyOTP,
} from "./controller";
import { authMiddleware } from "./authMiddleware";
import db from "./../db";
import excludeProperties from "./../utils/excludeProperties";

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
      email: req.user?.email ?? "",
    },
  });
  res.send(excludeProperties(user ?? {}, ["password"]));
});

router.post("/login", login);
router.get("/generate-otp", generateOTP);
router.post("/verify-otp", verifyOTP);
router.post("/update-password/", updatePassword);
router.post("/refresh-token", refreshToken);
router.get("/logout", logout);

router.post("/create-user", createUser);
router.post("/activate/:token", activateUser);
router.delete("/delete-user/:id", deleteUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
