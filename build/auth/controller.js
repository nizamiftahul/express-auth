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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.generateOTP = exports.logout = exports.refreshToken = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const JWT_TOKEN_SECRET = (_a = process.env.JWT_TOKEN_SECRET) !== null && _a !== void 0 ? _a : "JWT_TOKEN_SECRET";
const JWT_REFRESH_SECRET = (_b = process.env.JWT_REFRESH_SECRET) !== null && _b !== void 0 ? _b : "JWT_REFRESH_SECRET";
const refreshTokens = {};
const generateJWT = ({ email, otpSecret, }) => {
    return jsonwebtoken_1.default.sign({ email, otpSecret }, JWT_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};
const generateRefreshJWT = ({ email }) => {
    return jsonwebtoken_1.default.sign({ email }, JWT_REFRESH_SECRET, { expiresIn: "1d" });
};
const login = (db) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield db.c_user.findFirst({
        where: {
            email,
        },
    });
    if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
    }
    const accessToken = generateJWT({ email, otpSecret: true });
    res.json({ accessToken });
});
exports.login = login;
const refreshToken = (req, res) => {
    const { token } = req.body;
    const authorization = req.headers["authorization"];
    const accessToken = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1];
    if (refreshTokens[token] !== accessToken) {
        return res.sendStatus(403);
    }
    jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        const { email } = decoded;
        const accessToken = generateJWT({ email, otpSecret: false });
        refreshTokens[token] = accessToken;
        res.json({ accessToken });
    });
};
exports.refreshToken = refreshToken;
const logout = (req, res) => {
    var _a, _b;
    delete refreshTokens[(_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : ""];
    res.sendStatus(204);
};
exports.logout = logout;
const generateOTP = (db) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const email = (_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.email) !== null && _d !== void 0 ? _d : "";
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    yield db.c_user.update({
        where: {
            email,
        },
        data: {
            otp,
        },
    });
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    transporter
        .sendMail({
        from: "your@example.comas",
        to: email,
        subject: "Your OTP for Login",
        text: `Your OTP is: ${otp}`,
    })
        .then(() => {
        res.status(200).send("OTP sent successfully");
    })
        .catch((error) => {
        console.error("Error sending OTP:", error);
        res.status(500).send("Failed to send OTP");
    });
});
exports.generateOTP = generateOTP;
const verifyOTP = (db) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const email = (_f = (_e = req.user) === null || _e === void 0 ? void 0 : _e.email) !== null && _f !== void 0 ? _f : "";
    const { otp } = req.body;
    const user = yield db.c_user.findFirst({ where: { email } });
    if (!user || !user.otp) {
        return res.status(404).send("User not found or OTP not enabled");
    }
    if (user.otp !== otp) {
        return res.status(401).send("Invalid OTP");
    }
    yield db.c_user.update({
        where: {
            email,
        },
        data: {
            otp: null,
            last_login: new Date(),
        },
    });
    const accessToken = generateJWT({ email, otpSecret: false });
    const refreshToken = generateRefreshJWT({ email });
    refreshTokens[refreshToken] = accessToken;
    res.status(200).json({ accessToken, refreshToken });
});
exports.verifyOTP = verifyOTP;
