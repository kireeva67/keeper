import "express";
import { TTableUserData } from "./Types";
declare module "express-serve-static-core" {
    interface Request {
        userId?: number;
        user?: TTableUserData | null;
        sessionId?: number;
    }
}
