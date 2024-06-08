"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = require("express");
const controller_1 = require("./controller");
const authMiddleware_1 = __importStar(require("./authMiddleware"));
const db_1 = __importDefault(require("@src/db"));
const excludeProperties_1 = __importDefault(require("@src/utils/excludeProperties"));
const router = (0, express_1.Router)();
router.get("/", (0, authMiddleware_1.default)([]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield db_1.default.c_user.findFirst({
        where: {
            email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email,
        },
    });
    res.send((0, excludeProperties_1.default)(user !== null && user !== void 0 ? user : {}, ["password"]));
}));
router.post("/login", (0, controller_1.login)(db_1.default));
router.post("/refresh-token", controller_1.refreshToken);
router.get("/logout", (0, authMiddleware_1.default)([]), controller_1.logout);
router.get("/generate-otp", authMiddleware_1.authOTPMiddleware, (0, controller_1.generateOTP)(db_1.default));
router.post("/verify-otp", authMiddleware_1.authOTPMiddleware, (0, controller_1.verifyOTP)(db_1.default));
exports.default = router;
