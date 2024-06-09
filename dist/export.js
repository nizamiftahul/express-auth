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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareSync = exports.hashSync = exports.verifyOTP = exports.updatePassword = exports.resetPassword = exports.refreshToken = exports.logout = exports.login = exports.generateOTP = exports.forgotPassword = exports.deleteUser = exports.createUser = exports.activateUser = exports.authOTPMiddleware = exports.authMiddleware = void 0;
var authMiddleware_1 = require("./auth/authMiddleware");
Object.defineProperty(exports, "authMiddleware", { enumerable: true, get: function () { return authMiddleware_1.authMiddleware; } });
Object.defineProperty(exports, "authOTPMiddleware", { enumerable: true, get: function () { return authMiddleware_1.authOTPMiddleware; } });
var controller_1 = require("./auth/controller");
Object.defineProperty(exports, "activateUser", { enumerable: true, get: function () { return controller_1.activateUser; } });
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return controller_1.createUser; } });
Object.defineProperty(exports, "deleteUser", { enumerable: true, get: function () { return controller_1.deleteUser; } });
Object.defineProperty(exports, "forgotPassword", { enumerable: true, get: function () { return controller_1.forgotPassword; } });
Object.defineProperty(exports, "generateOTP", { enumerable: true, get: function () { return controller_1.generateOTP; } });
Object.defineProperty(exports, "login", { enumerable: true, get: function () { return controller_1.login; } });
Object.defineProperty(exports, "logout", { enumerable: true, get: function () { return controller_1.logout; } });
Object.defineProperty(exports, "refreshToken", { enumerable: true, get: function () { return controller_1.refreshToken; } });
Object.defineProperty(exports, "resetPassword", { enumerable: true, get: function () { return controller_1.resetPassword; } });
Object.defineProperty(exports, "updatePassword", { enumerable: true, get: function () { return controller_1.updatePassword; } });
Object.defineProperty(exports, "verifyOTP", { enumerable: true, get: function () { return controller_1.verifyOTP; } });
var bcrypt_1 = require("bcrypt");
Object.defineProperty(exports, "hashSync", { enumerable: true, get: function () { return bcrypt_1.hashSync; } });
Object.defineProperty(exports, "compareSync", { enumerable: true, get: function () { return bcrypt_1.compareSync; } });
__exportStar(require("./utils/excludeProperties"), exports);
