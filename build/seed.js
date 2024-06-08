"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seed = (db) => {
    console.log(path_1.default.join(__dirname), process.cwd());
    (0, child_process_1.exec)("npx prisma migrate deploy", (err, stdout, stderr) => {
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
    const seed = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Create roles
            const superadminRole = yield db.c_role.upsert({
                where: { name: "superadmin" },
                update: {},
                create: { name: "superadmin" },
            });
            // Create users with hashed passwords
            const hashedPassword = yield bcryptjs_1.default.hash("12345", 10);
            yield db.c_user.upsert({
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
        }
        catch (error) {
            console.error("Error seeding data:", error);
        }
        finally {
            yield db.$disconnect();
        }
    });
};
exports.default = seed;
