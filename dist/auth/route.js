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
const express_1 = require("express");
const controller_1 = require("./controller");
const authMiddleware_1 = require("./authMiddleware");
const db_1 = __importDefault(require("./../db"));
const excludeProperties_1 = __importDefault(require("./../utils/excludeProperties"));
const router = (0, express_1.Router)();
router.get("/", (0, authMiddleware_1.authMiddleware)([]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield db_1.default.c_user.findFirst({
        where: {
            email: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : "",
        },
    });
    res.send((0, excludeProperties_1.default)(user !== null && user !== void 0 ? user : {}, ["password"]));
}));
router.post("/login", controller_1.login);
router.get("/generate-otp", controller_1.generateOTP);
router.post("/verify-otp", controller_1.verifyOTP);
router.post("/update-password/", controller_1.updatePassword);
router.post("/refresh-token", controller_1.refreshToken);
router.get("/logout", controller_1.logout);
router.post("/create-user", controller_1.createUser);
router.post("/activate/:token", controller_1.activateUser);
router.delete("/delete-user/:id", controller_1.deleteUser);
router.post("/forgot-password", controller_1.forgotPassword);
router.post("/reset-password/:token", controller_1.resetPassword);
exports.default = router;
