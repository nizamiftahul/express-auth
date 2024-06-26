import { Request, Response } from "express";
export declare const requestOtps: {
    [key: string]: string;
};
export declare const refreshTokens: {
    [key: string]: string;
};
export declare const login: (roles?: string[]) => (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const logout: (req: Request, res: Response) => void;
export declare const generateOTP: (req: Request, res: Response) => void;
export declare const verifyOTP: (req: Request, res: Response) => Promise<void>;
export declare const createUser: (req: Request, res: Response) => Promise<void>;
export declare const activateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: Request, res: Response) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resetPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePassword: (req: Request, res: Response) => Promise<void>;
