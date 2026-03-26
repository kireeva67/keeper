import passport from "passport";
import { Router } from "express";
import { TTableUserData, TToken } from "../types/Types";
import { prismaController } from "../prisma/PrismaController";
import { getCookieDefaults } from "../utils/getCookie";
import { log } from "console";
import { getPasswordError, hashPassword, validateNewPassword } from "../utils/password";
import { requireAuth } from "../middleware/CookieMiddleware";

export const authRouter = Router();

authRouter.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

// session: false = don't try to serialize the authenticated user into a session, as i hadle sessions myself
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), async (req, res) => {
    const user = req.user as TTableUserData;
    const token: TToken = await prismaController.createSession(user.email);
    log('Created session token:', token);
    res.cookie("sid", token.token, getCookieDefaults(token.validTo));
    log('Set session cookie', res.cookie);
    res.redirect(`${process.env.CLIENT_URL}/products`);
});

authRouter.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await prismaController.findUser(email);
        log('Signup attempt for email:', email, 'existing user:', existingUser);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        const passwordError = validateNewPassword(password);
        if (passwordError) {
            return res.status(400).json({ message: passwordError });
        }
        const hash = await hashPassword(password);
        await prismaController.upsertUser(email, hash);
        const token = await prismaController.createSession(email);
        res.cookie("sid", token.token, getCookieDefaults(token.validTo));
        res.json(true);
    } catch (error) {
        console.error('Failed to sign up:', error);
        res.status(500).json({ message: 'Failed to sign up.' });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prismaController.findUser(email);
        log('Login attempt for email:', email, 'found user:', user);
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const passwordError = await getPasswordError(user.password, password);
        log('Password validation result for email:', email, 'error:', passwordError);
        if (passwordError) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = await prismaController.createSession(user.email);
        res.cookie("sid", token.token, getCookieDefaults(token.validTo));
        log('User logged in, session cookie set:', token);
        res.json(true);
    } catch (error) {
        console.error('Failed to login:', error);
        res.status(500).json({ message: 'Invalid credentials.' });
    }
});

authRouter.delete('/session', requireAuth, async (req, res) => {
    try {
        await prismaController.deleteSession((req as any).sessionId);
        res.clearCookie('sid');
        res.json(true);
    } catch (error) {
        console.error('Failed to logout:', error);
        return res.status(500).json({ message: 'Failed to logout.' });
    }
});
