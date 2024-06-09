# Express Auth

Install express-auth with npm

```bash
  npm i https://github.com/nizamiftahul/express-auth.git
```

Create .env file

```bash
DATABASE_URL=
JWT_TOKEN_SECRET=
JWT_REFRESH_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

Init

```bash
  npx express-auth init
```

Change provider

```bash
  npx express-auth use mysql
```

## Features

- Login
- Refresh Token
- Generate OTP
- Verify OTP
- Logout

## Usage / Example

```javascript
import express, { Router, Response, Request } from "express";
import bodyParser from "body-parser";
import {
  login,
  authOTPMiddleware,
  generateOTP,
  logout,
  refreshToken,
  verifyOTP,
  updatePassword,
  createUser,
  activateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} from "express-auth";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

app.get("/", authMiddleware([]), async (req: Request, res: Response) => {
  const user = await dbAuth.c_user.findFirst({
    where: {
      email: req.user?.email,
    },
  });
  res.send(excludeProperties(user ?? {}, ["password"]));
});

app.post("/login", login);
app.get("/generate-otp", generateOTP);
app.post("/verify-otp", verifyOTP);
app.post("/update-password/", updatePassword);
app.post("/refresh-token", refreshToken);
app.get("/logout", logout);

app.post("/create-user", createUser);
app.post("/activate/:token", activateUser);
app.delete("/delete-user/:id", deleteUser);

app.post("/forgot-password", forgotPassword);
app.post("/reset-password/:token", resetPassword);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```
