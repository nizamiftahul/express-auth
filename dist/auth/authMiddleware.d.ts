import { Request, Response, NextFunction } from "express";
export declare const authMiddleware: (permissions: Array<string>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authOTPMiddleware: (req: Request, res: Response, next: NextFunction) => void;
