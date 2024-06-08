import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@src/db";
import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET ?? "JWT_TOKEN_SECRET";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "JWT_REFRESH_SECRET";

const refreshTokens: { [key: string]: string } = {};

const generateJWT = ({
  email,
  otpSecret,
}: {
  email: string;
  otpSecret: boolean;
}) => {
  return jwt.sign({ email, otpSecret }, JWT_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshJWT = ({ email }: { email: string }) => {
  return jwt.sign({ email }, JWT_REFRESH_SECRET, { expiresIn: "1d" });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await db.c_user.findFirst({
    where: {
      email,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid username or password" });
    return;
  }

  const accessToken = generateJWT({ email, otpSecret: true });

  res.json({ accessToken });
};

export const refreshToken = (req: Request, res: Response) => {
  const { token } = req.body;

  const authorization = req.headers["authorization"];
  const accessToken = authorization?.split(" ")[1];

  if (refreshTokens[token] !== accessToken) {
    return res.sendStatus(403);
  }

  jwt.verify(
    token,
    JWT_REFRESH_SECRET,
    (
      err: jwt.VerifyErrors | null,
      decoded: string | jwt.JwtPayload | undefined
    ) => {
      if (err) {
        return res.sendStatus(403);
      }

      const { email } = decoded as any;
      const accessToken = generateJWT({ email, otpSecret: false });
      refreshTokens[token] = accessToken;
      res.json({ accessToken });
    }
  );
};

export const logout = (req: Request, res: Response) => {
  delete refreshTokens[req.user?.email ?? ""];
  res.sendStatus(204);
};

export const generateOTP = async (req: Request, res: Response) => {
  const email = req.user?.email ?? "";
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(email);
  await db.c_user.update({
    where: {
      email,
    },
    data: {
      otp,
    },
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter
    .sendMail({
      from: "your@example.comas",
      to: email,
      subject: "Your OTP for Login",
      text: `Your OTP is: ${otp}`,
    })
    .then(() => {
      res.status(200).send("OTP sent successfully");
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      res.status(500).send("Failed to send OTP");
    });
};

export const verifyOTP = async (req: Request, res: Response) => {
  const email = req.user?.email ?? "";
  const { otp } = req.body;

  const user = await db.c_user.findFirst({ where: { email } });

  if (!user || !user.otp) {
    return res.status(404).send("User not found or OTP not enabled");
  }

  if (user.otp !== otp) {
    return res.status(401).send("Invalid OTP");
  }

  await db.c_user.update({
    where: {
      email,
    },
    data: {
      otp: null,
      last_login: new Date(),
    },
  });

  const accessToken = generateJWT({ email, otpSecret: false });
  const refreshToken = generateRefreshJWT({ email });
  refreshTokens[refreshToken] = accessToken;
  res.status(200).json({ accessToken, refreshToken });
};
