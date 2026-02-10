import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import dotenv from 'dotenv';
import { prismaController } from './prisma/PrismaController';
import { log } from 'node:console';
import { TTableProductData, TTableUserData } from './types/TableTypes';
import cookieParser from "cookie-parser";
import { TToken } from './types/Token';
import cors from "cors";
import { requireAuth } from './middleware/CookieMiddleware';


dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

if (process.env.SESSION_SECRET) {
    app.use(session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false
    }));
}

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/google/callback`
    },
        async function (accessToken, refreshToken, profile, done) {
            console.log(profile);

            const email = profile.emails?.[0]?.value?.toLowerCase() ?? null;
            const isVerified = profile.emails?.[0]?.verified;
            if (!email || !isVerified) {
                return done(new Error("Invalid credantials"));
            };

            const user = await prismaController.upsertUser(email);
            log('Upserted user:', user);
            return done(null, { password: user.password, email });
        }));
} else {
    throw new Error('Google OAuth credentials not set');
}

passport.serializeUser((user: Express.User, done) => {
    done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
});




// app.get('/', (req, res) => {
//     res.sendFile('index.html', { root: './public' });
// });

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async function (req, res) {
        const user = req.user as TTableUserData;
        const token: TToken = await prismaController.createSession(user.email);
        log('Created session token:', token);
        res.cookie("sid", token.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
            sameSite: "lax",                           // good default for OAuth redirects
            path: "/",                                 // send for all routes
            expires: token.validTo
        });
        log('Set session cookie', res.cookie);
        res.redirect(`${process.env.CLIENT_URL}/products`);
    });

app.get(`/api/products`, requireAuth, async (req, res) => {
    const user = (req as any).user;
    const products = await prismaController.getProductsForUser(user.email);
    log('Fetched products for user:', products);
    res.json(products);
});

app.post(`/api/products`, requireAuth, async (req, res) => {
    log('Attempting to create product for user:', req.user);
    const user = (req as any).user;
    const body: TTableProductData = req.body;
    const product = await prismaController.createProduct(user.email, body);
    log('Created product for user:', product);
    res.json(product);
});

app.get(`/api/healthCheck`, requireAuth, async (req, res) => { //TODO add check on render if user still logged in
    const user = (req as any).user;
    res.json({
        valide: true,
        user: { email: user.email, id: user.id }
    });
});

app.listen(3000, () => {
    console.log(`Server started on ${process.env.API_URL}`);
});