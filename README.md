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
  init,
  logout,
  refreshToken,
  verifyOTP,
} from "express-auth";

import dotenv from "dotenv";
dotenv.config();

const dbAuth = init(process.env.DATABASE_URL ?? "");

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

app.post("/login", login(dbAuth));
app.post("/refresh-token", refreshToken);
app.get("/logout", authMiddleware([]), logout);
app.get("/generate-otp", authOTPMiddleware, generateOTP(dbAuth));
app.post("/verify-otp", authOTPMiddleware, verifyOTP(dbAuth));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```
