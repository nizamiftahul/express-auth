"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const init = (url) => {
    return new client_1.PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    });
};
exports.init = init;
exports.default = (0, exports.init)((_a = process.env.DATABASE_URL) !== null && _a !== void 0 ? _a : "");
