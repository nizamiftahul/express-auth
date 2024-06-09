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
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.deleteUser = exports.activateUser = exports.createUser = exports.verifyOTP = exports.generateOTP = exports.logout = exports.refreshToken = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const authMiddleware_1 = require("./authMiddleware");
const db_1 = __importDefault(require("./../db"));
const JWT_TOKEN_SECRET = (_a = process.env.JWT_TOKEN_SECRET) !== null && _a !== void 0 ? _a : "JWT_TOKEN_SECRET";
const JWT_REFRESH_SECRET = (_b = process.env.JWT_REFRESH_SECRET) !== null && _b !== void 0 ? _b : "JWT_REFRESH_SECRET";
const refreshTokens = {};
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const generateJWT = ({ email, otpSecret, }) => {
    return jsonwebtoken_1.default.sign({ email, otpSecret }, JWT_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};
const generateRefreshJWT = ({ email }) => {
    return jsonwebtoken_1.default.sign({ email }, JWT_REFRESH_SECRET, { expiresIn: "1d" });
};
function generateToken() {
    return crypto_1.default.randomBytes(20).toString("hex");
}
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield db_1.default.c_user.findFirst({
        where: {
            email,
            is_active: true,
            is_deleted: false,
        },
    });
    if (!user || !bcrypt_1.default.compareSync(password, user.password)) {
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
const generateOTP = (req, res) => {
    (0, authMiddleware_1.authOTPMiddleware)(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const email = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : "";
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        yield db_1.default.c_user.update({
            where: {
                email,
            },
            data: {
                otp,
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
            res.status(200).send("OTP have been sent to your email.");
        })
            .catch((error) => {
            console.error("Error sending OTP:", error);
            res.status(500).send("Failed to send OTP");
        });
    }));
};
exports.generateOTP = generateOTP;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, authMiddleware_1.authOTPMiddleware)(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        const email = (_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.email) !== null && _d !== void 0 ? _d : "";
        const { otp } = req.body;
        const user = yield db_1.default.c_user.findFirst({ where: { email } });
        if (!user || !user.otp) {
            return res.status(404).send("User not found or OTP not enabled");
        }
        if (user.otp !== otp) {
            return res.status(401).send("Invalid OTP");
        }
        yield db_1.default.c_user.update({
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
    }));
});
exports.verifyOTP = verifyOTP;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, authMiddleware_1.authMiddleware)([])(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, c_role_id } = req.body;
            const hashedPassword = bcrypt_1.default.hashSync(password, 10);
            const token = generateToken();
            yield db_1.default.c_user.create({
                data: {
                    email,
                    password: hashedPassword,
                    c_role_id: c_role_id,
                    activeToken: token,
                },
            });
            transporter
                .sendMail({
                from: "your@example.comas",
                to: email,
                subject: "Activate Your Account",
                text: `To activate your account, click the following link: ${req.hostname}/activate/${token}`,
            })
                .then(() => {
                res.status(200).send("Activation link sent successfully");
            })
                .catch((error) => {
                console.error("Error sending Activation Link:", error);
                res.status(500).send("Failed to send Activation Link");
            });
        }
        catch (e) {
            res.status(500).send(JSON.stringify(e));
        }
    }));
});
exports.createUser = createUser;
const activateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    const user = yield db_1.default.c_user.findFirst({
        where: {
            activeToken: token,
        },
    });
    if (!user) {
        return res.status(400).send("Invalid or expired token");
    }
    yield db_1.default.c_user.update({
        where: {
            id: user.id,
        },
        data: {
            is_active: true,
            activeToken: null,
        },
    });
    res.send("Account activated successfully.");
});
exports.activateUser = activateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, authMiddleware_1.authMiddleware)([])(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = Number(req.params.id);
            const data = yield db_1.default.c_user.update({
                where: {
                    id,
                },
                data: {
                    is_deleted: true,
                },
            });
            res.send(data);
        }
        catch (e) {
            res.status(500).send(JSON.stringify(e));
        }
    }));
});
exports.deleteUser = deleteUser;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield db_1.default.c_user.findFirst({
            where: {
                email,
            },
        });
        if (!user)
            return res.status(404).send("User not found");
        const token = generateToken();
        yield db_1.default.c_user.update({
            where: {
                email,
            },
            data: {
                email,
                resetToken: token,
            },
        });
        transporter
            .sendMail({
            from: "your@example.comas",
            to: email,
            subject: "Reset Your Password",
            text: `To reset your password, click the following link: ${req.hostname}/reset/${token}`,
        })
            .then(() => {
            res
                .status(200)
                .send("Reset Password link have been sent to your email.");
        })
            .catch((error) => {
            console.error("Error sending Forgot Password Link:", error);
            res.status(500).send("Failed to send Forgot Password");
        });
    }
    catch (e) {
        res.status(500).send(JSON.stringify(e));
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.params.token;
        const { password } = req.body;
        const hashedPassword = bcrypt_1.default.hashSync(password, 10);
        const user = yield db_1.default.c_user.findFirst({
            where: {
                resetToken: token,
            },
        });
        if (!user)
            return res.status(404).send("Invalid or expired token");
        yield db_1.default.c_user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashedPassword,
                resetToken: null,
            },
        });
        res.send("Password has been reset successfully.");
    }
    catch (e) {
        res.status(500).send(JSON.stringify(e));
    }
});
exports.resetPassword = resetPassword;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, authMiddleware_1.authMiddleware)([])(req, res, () => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        try {
            const email = (_e = req.user) === null || _e === void 0 ? void 0 : _e.email;
            const { newPassword, currentPassword } = req.body;
            const user = yield db_1.default.c_user.findFirst({
                where: {
                    email,
                },
            });
            if (!user) {
                return res.status(404).send("User not found");
            }
            // Verify the current password
            if (!bcrypt_1.default.compareSync(currentPassword, user.password)) {
                return res.status(401).send("Incorrect current password");
            }
            // Hash the new password
            const hashedNewPassword = bcrypt_1.default.hashSync(newPassword, 10);
            yield db_1.default.c_user.update({
                where: {
                    email,
                },
                data: {
                    password: hashedNewPassword,
                },
            });
            res.send("Password has been update successfully.");
        }
        catch (e) {
            res.status(500).send(JSON.stringify(e));
        }
    }));
});
exports.updatePassword = updatePassword;
