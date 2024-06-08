import express from "express";
import bodyParser from "body-parser";
import auth from "./auth/route";
import {
  generateOTP,
  login,
  logout,
  refreshToken,
  verifyOTP,
} from "./auth/controller";
import authMiddleware, { authOTPMiddleware } from "./auth/authMiddleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/auth", auth);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  process.exit();
});

export default {
  login,
  logout,
  refreshToken,
  generateOTP,
  verifyOTP,
  authMiddleware,
  authOTPMiddleware,
};
