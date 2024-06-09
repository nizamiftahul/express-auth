declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                role: string;
            };
        }
    }
}
declare const router: import("express-serve-static-core").Router;
export default router;
