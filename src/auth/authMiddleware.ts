import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { requestOtps } from "./controller";
import db from "../db";

import dotenv from "dotenv";
dotenv.config();

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET ?? "JWT_TOKEN_SECRET";

export const authMiddleware = (permissions: Array<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers["authorization"];
      const token = authorization?.split(" ")[1];

      if (token) {
        jwt.verify(token, JWT_TOKEN_SECRET, async (err, decoded) => {
          if (err) {
            return res.sendStatus(403);
          }

          if (requestOtps[token]) return res.sendStatus(401);

          const user = await db.c_user.findFirst({
            where: {
              email: decoded as string,
            },
            include: {
              c_role: true,
            },
          });

          if (
            !user ||
            (permissions.length > 0 &&
              permissions.indexOf(user.c_role.name) < 0)
          ) {
            return res.sendStatus(401);
          }

          req.user = {
            id: user?.id,
            email: user?.email,
            role: user?.c_role.name,
          };

          next();
        });
      } else {
        res.sendStatus(401);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  };
};

export const authOTPMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers["authorization"];
    const token = authorization?.split(" ")[1];
    if (token) {
      jwt.verify(token, JWT_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          return res.sendStatus(403);
        }

        const user = await db.c_user.findFirst({
          where: {
            email: decoded as string,
          },
          include: {
            c_role: true,
          },
        });

        if (!user) {
          return res.sendStatus(401);
        }

        req.user = {
          id: user?.id,
          email: user?.email,
          role: user?.c_role.name,
        };
        next();
      });
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    res.status(500).send(e);
  }
};
