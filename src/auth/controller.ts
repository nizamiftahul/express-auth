import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { authMiddleware, authOTPMiddleware } from "./authMiddleware";
import db from "./../db";

import dotenv from "dotenv";
dotenv.config();

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET ?? "JWT_TOKEN_SECRET";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "JWT_REFRESH_SECRET";
const JWT_TOKEN_EXPIRED = process.env.JWT_TOKEN_EXPIRED ?? "15m";
const JWT_REFRESH_EXPIRED = process.env.JWT_REFRESH_EXPIRED ?? "1dS";

export const requestOtps: { [key: string]: string } = {};
export const refreshTokens: { [key: string]: string } = {};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateJWT = (email: string) => {
  return jwt.sign({ email }, JWT_TOKEN_SECRET, {
    expiresIn: JWT_TOKEN_EXPIRED,
  });
};

const generateRefreshJWT = (email: string) => {
  return jwt.sign({ email }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRED,
  });
};

function generateToken() {
  return crypto.randomBytes(20).toString("hex");
}

export const login =
  (roles?: string[]) => async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await db.c_user.findFirst({
      where: {
        email: email ?? "",
        is_active: true,
        is_deleted: false,
        c_role: {
          name: {
            in: roles,
          },
        },
      },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const accessToken = generateJWT(email);
    requestOtps[accessToken] = "";

    res.json({ accessToken });
  };

export const refreshToken = (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const authorization = req.headers["authorization"];
  const accessToken = authorization?.split(" ")[1];

  if (refreshTokens[refreshToken] !== accessToken) {
    return res.sendStatus(403);
  }

  jwt.verify(
    refreshToken,
    JWT_REFRESH_SECRET,
    (
      err: jwt.VerifyErrors | null,
      decoded: string | jwt.JwtPayload | undefined
    ) => {
      if (err) {
        return res.sendStatus(403);
      }

      const accessToken = generateJWT((decoded as any).email);
      refreshTokens[refreshToken] = accessToken;
      res.json({ accessToken });
    }
  );
};

export const logout = (req: Request, res: Response) => {
  delete refreshTokens[req.user?.email ?? ""];
  res.sendStatus(204);
};

export const generateOTP = (req: Request, res: Response) => {
  authOTPMiddleware(req, res, async () => {
    const email = req.user?.email ?? "";
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // await db.c_user.update({
    //   where: {
    //     email,
    //   },
    //   data: {
    //     otp,
    //   },
    // });

    transporter
      .sendMail({
        from: "your@example.comas",
        to: email,
        subject: "Your OTP for Login",
        text: `Your OTP is: ${otp}`,
      })
      .then(() => {
        const authorization = req.headers["authorization"];
        const token = authorization?.split(" ")[1] ?? "";
        requestOtps[token] = otp;
        if (process.env.NODE_ENV === "development")
          res.status(200).send(`OTP ${otp} have been sent to your email.`);
        else res.status(200).send(`OTP have been sent to your email.`);
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
        res.status(500).send("Failed to send OTP");
      });
  });
};

export const verifyOTP = async (req: Request, res: Response) => {
  authOTPMiddleware(req, res, async () => {
    const email = req.user?.email ?? "";
    const { otp } = req.body;

    const user = await db.c_user.findFirst({ where: { email: email } });

    const authorization = req.headers["authorization"];
    const token = authorization?.split(" ")[1] ?? "";

    if (!user || !requestOtps[token]) {
      return res.status(404).send("User not found or OTP not enabled");
    }

    if (requestOtps[token] !== otp) {
      return res.status(401).send("Invalid OTP");
    }

    await db.c_user.update({
      where: {
        email,
      },
      data: {
        last_login: new Date(),
      },
    });

    delete requestOtps[token];
    const refreshToken = generateRefreshJWT(email);
    refreshTokens[refreshToken] = token;
    res.status(200).json({ refreshToken });
  });
};

export const createUser = async (req: Request, res: Response) => {
  authMiddleware("c_user.create")(req, res, async () => {
    try {
      const { email, password, c_role_id } = req.body;
      const hashedPassword = bcrypt.hashSync(password, 10);
      const token = generateToken();

      await db.c_user.create({
        data: {
          email,
          password: hashedPassword,
          c_role_id: c_role_id,
          activeToken: token,
        },
      });

      transporter
        .sendMail({
          from: "your@example.comas",
          to: email,
          subject: "Activate Your Account",
          text: `To activate your account, click the following link: ${req.hostname}/activate/${token}`,
        })
        .then(() => {
          res.status(200).send("Activation link sent successfully");
        })
        .catch((error) => {
          console.error("Error sending Activation Link:", error);
          res.status(500).send("Failed to send Activation Link");
        });
    } catch (e) {
      res.status(500).send(JSON.stringify(e));
    }
  });
};

export const activateUser = async (req: Request, res: Response) => {
  const token = req.params.token ?? "";
  const user = await db.c_user.findFirst({
    where: {
      activeToken: token,
    },
  });

  if (!user) {
    return res.status(400).send("Invalid or expired token");
  }

  await db.c_user.update({
    where: {
      id: user.id,
    },
    data: {
      is_active: true,
      activeToken: null,
    },
  });

  res.send("Account activated successfully.");
};

export const deleteUser = async (req: Request, res: Response) => {
  authMiddleware("c_user.delete")(req, res, async () => {
    try {
      const id = Number(req.params.id);
      const data = await db.c_user.update({
        where: {
          id,
        },
        data: {
          is_deleted: true,
        },
      });
      res.send(data);
    } catch (e) {
      res.status(500).send(JSON.stringify(e));
    }
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await db.c_user.findFirst({
      where: {
        email: email ?? "",
      },
    });

    if (!user) return res.status(404).send("User not found");

    const token = generateToken();

    await db.c_user.update({
      where: {
        email,
      },
      data: {
        email,
        resetToken: token,
      },
    });

    transporter
      .sendMail({
        from: "your@example.comas",
        to: email,
        subject: "Reset Your Password",
        text: `To reset your password, click the following link: ${req.hostname}/reset/${token}`,
      })
      .then(() => {
        res
          .status(200)
          .send("Reset Password link have been sent to your email.");
      })
      .catch((error) => {
        console.error("Error sending Forgot Password Link:", error);
        res.status(500).send("Failed to send Forgot Password");
      });
  } catch (e) {
    res.status(500).send(JSON.stringify(e));
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const token = req.params.token ?? "";
    const { password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await db.c_user.findFirst({
      where: {
        resetToken: token,
      },
    });

    if (!user) return res.status(404).send("Invalid or expired token");

    await db.c_user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
      },
    });

    res.send("Password has been reset successfully.");
  } catch (e) {
    res.status(500).send(JSON.stringify(e));
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  authMiddleware()(req, res, async () => {
    try {
      const email = req.user?.email ?? "";
      const { newPassword, currentPassword } = req.body;

      const user = await db.c_user.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        return res.status(404).send("User not found");
      }

      // Verify the current password
      if (!bcrypt.compareSync(currentPassword, user.password)) {
        return res.status(401).send("Incorrect current password");
      }

      // Hash the new password
      const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
      await db.c_user.update({
        where: {
          email,
        },
        data: {
          password: hashedNewPassword,
        },
      });
      res.send("Password has been update successfully.");
    } catch (e) {
      res.status(500).send(JSON.stringify(e));
    }
  });
};
