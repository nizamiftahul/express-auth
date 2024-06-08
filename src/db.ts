import { PrismaClient } from "@prisma/client";

import dotenv from "dotenv";
dotenv.config();

export const init = (url: string) => {
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
};

export default init(process.env.DATABASE_URL ?? "");
