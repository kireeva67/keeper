import "express";
import { TTableUserData } from "./TableTypes";
declare module "express-serve-static-core" {
    interface Request {
        userId?: number;
        user?: TTableUserData | null;
        sessionId?: number;
    }
}
