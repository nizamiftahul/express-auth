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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOTPMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("../db"));
dotenv_1.default.config();
const JWT_TOKEN_SECRET = (_a = process.env.JWT_TOKEN_SECRET) !== null && _a !== void 0 ? _a : "JWT_TOKEN_SECRET";
const authMiddleware = (permissions) => {
    return (req, res, next) => {
        try {
            const authorization = req.headers["authorization"];
            const token = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1];
            if (token) {
                jsonwebtoken_1.default.verify(token, JWT_TOKEN_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
                    if (err) {
                        return res.sendStatus(403);
                    }
                    const { email, otpSecret } = decoded;
                    if (otpSecret)
                        return res.sendStatus(401);
                    const user = yield db_1.default.c_user.findFirst({
                        where: {
                            email,
                        },
                        include: {
                            c_role: true,
                        },
                    });
                    if (!user ||
                        (permissions.length > 0 &&
                            permissions.indexOf(user.c_role.name) < 0)) {
                        return res.sendStatus(401);
                    }
                    req.user = {
                        id: user === null || user === void 0 ? void 0 : user.id,
                        email: user === null || user === void 0 ? void 0 : user.email,
                        role: user === null || user === void 0 ? void 0 : user.c_role.name,
                    };
                    next();
                }));
            }
            else {
                res.sendStatus(401);
            }
        }
        catch (e) {
            res.status(500).send(e);
        }
    };
};
exports.authMiddleware = authMiddleware;
const authOTPMiddleware = (req, res, next) => {
    try {
        const authorization = req.headers["authorization"];
        const token = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1];
        if (token) {
            jsonwebtoken_1.default.verify(token, JWT_TOKEN_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    return res.sendStatus(403);
                }
                const { email } = decoded;
                const user = yield db_1.default.c_user.findFirst({
                    where: {
                        email,
                    },
                    include: {
                        c_role: true,
                    },
                });
                if (!user) {
                    return res.sendStatus(401);
                }
                req.user = {
                    id: user === null || user === void 0 ? void 0 : user.id,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    role: user === null || user === void 0 ? void 0 : user.c_role.name,
                };
                next();
            }));
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (e) {
        res.status(500).send(e);
    }
};
exports.authOTPMiddleware = authOTPMiddleware;
