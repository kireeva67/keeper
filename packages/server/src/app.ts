import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { prismaController } from './prisma/PrismaController';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger';
import cookieParser from "cookie-parser";
import cors from "cors";
import { requireAuth } from './middleware/CookieMiddleware';
import { authRouter } from './routes/auth';
import { productsRouter } from './routes/products';
import { categoriesRouter } from './routes/categories';
import { meRouter } from './routes/me';

dotenv.config();
export const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({
    logger,
    // Log only what is needed to debug a request; never headers (cookies, auth).
    serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
    },
}));
app.use(passport.initialize());

// Set up Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/google/callback`
    },
        async function (accessToken, refreshToken, profile, done) {
            const email = profile.emails?.[0]?.value?.toLowerCase() ?? null;
            const isVerified = profile.emails?.[0]?.verified;
            if (!email || !isVerified) {
                return done(new Error("Invalid credantials"));
            };

            const user = await prismaController.upsertUser(email, "");
            return done(null, { password: user.password, email });
        }));
} else {
    logger.warn('Google OAuth credentials not set: Google sign-in is disabled.');
}

app.get(`/api/healthCheck`, requireAuth, async (req, res) => {
    res.json(true);
});

app.use(`/auth`, authRouter);
app.use(`/api/products`, productsRouter);
app.use(`/api/categories`, categoriesRouter);
app.use(`/api/me`, meRouter);