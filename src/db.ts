import { PrismaClient } from "@prisma/client";

import dotenv from "dotenv";
dotenv.config();

export default new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL ?? "",
    },
  },
});
