import bcrypt from "bcryptjs";
import db from "../src/db";
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

const seed = () => {
  exec("npx prisma migrate deploy", (err, stdout, stderr) => {
    if (err) {
      console.error();
      console.error("Error:");
      console.error(err);
      console.error();
    }
    console.log(stdout);
    console.error(stderr);

    seed();
  });

  const seed = async () => {
    try {
      // Create roles
      const superadminRole = await db.c_role.upsert({
        where: { name: "superadmin" },
        update: {},
        create: { name: "superadmin" },
      });

      // Create users with hashed passwords
      const hashedPassword = await bcrypt.hash("12345", 10);
      await db.c_user.upsert({
        where: { email: "superadmin@email.com" },
        update: {},
        create: {
          fullname: "superadmin@email.com",
          email: "superadmin@email.com",
          password: hashedPassword,
          c_role_id: superadminRole.id,
        },
      });

      console.log("Seed data created successfully.");
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      await db.$disconnect();
    }
  };
};

export default seed;
