import type { Request, Response, NextFunction } from "express";
import { prismaController } from "../prisma/PrismaController";
import { log } from "node:console";
import { LOGIN_ROUTE } from "../config/pages";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.cookies?.sid;
    log('Auth middleware - session id from cookie:', raw);
    if (!raw) {
      if (req.path.startsWith('/api')) {
        return res.status(401).json({ error: 'Unauthorized' });
      } else {
        res.redirect(`${process.env.CLIENT_URL}${LOGIN_ROUTE}`);
        return;
      }
    };

    const session = await prismaController.findValidSession(raw);
    if (!session) {
      if (req.path.startsWith('/api')) {
        return res.status(401).json({ error: 'Unauthorized' });
      } else {
        res.redirect(`${process.env.CLIENT_URL}${LOGIN_ROUTE}`);
        return;
      }
    }

    (req as any).userId = session.userId; //TODO check types(include in tsconfig)
    (req as any).user = session.user;
    (req as any).sessionId = session.id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}