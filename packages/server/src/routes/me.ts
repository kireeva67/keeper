import { log } from "console";
import { Router } from "express";
import { requireAuth } from "../middleware/CookieMiddleware";
import { prismaController } from "../prisma/PrismaController";
import { TTableUserData } from "../types/TableTypes";
import { getPasswordError, hashPassword, validateNewPassword } from "../utils/password";

export const meRouter = Router();

meRouter.get('/', requireAuth, (req, res) => {
    try {
        const user = (req as any).user as TTableUserData;
        user.hasPassword = !!user.password;
        log('Fetching current user info:', (req as any).user);
        res.json((req as any).user);
    } catch (error) {
        console.error('Failed to fetch user info:', error);
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
        console.error('Failed to delete account:', error);
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
