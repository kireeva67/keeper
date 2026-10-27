import { Router } from "express";
import { requireAuth } from "../middleware/CookieMiddleware";
import { prismaController } from "../prisma/PrismaController";
import { TTableUserData } from "../types/Types";
import { getPasswordError, hashPassword, validateNewPassword } from "../utils/password";
import { logger } from "../utils/logger";

export const meRouter = Router();

meRouter.get('/', requireAuth, (req, res) => {
    try {
        const { id, email, password } = (req as any).user as TTableUserData;
        res.json({ id, email, hasPassword: !!password });
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch user info');
        res.status(500).json({ message: 'Failed to fetch user info.' });
    }
});

meRouter.delete('/', requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        await prismaController.deleteUser(user.email);
        res.clearCookie('sid');
        res.json(true);
    } catch (error) {
        logger.error({ err: error }, 'Failed to delete account');
        return res.status(500).json({ message: 'Failed to delete account.' });
    }
});

meRouter.put('/', requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const body: { newPassword: string; currentPassword: string } = req.body;
        const passwordError = await getPasswordError(user.password ?? null, body.currentPassword);
        if (passwordError) return res.status(400).json({ error: passwordError });

        const newError = validateNewPassword(body.newPassword);
        if (newError) return res.status(400).json({ error: newError });

        const hash = await hashPassword(body.newPassword);
        await prismaController.updatePassword(user.email, hash);
        res.json(true);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password.' });
    }
});
