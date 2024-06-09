"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = new client_1.PrismaClient({
    datasources: {
        db: {
            url: (_a = process.env.DATABASE_URL) !== null && _a !== void 0 ? _a : "",
        },
    },
});
