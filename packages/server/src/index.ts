import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import dotenv from 'dotenv';
import { prismaController } from './prisma/PrismaController';
import { log } from 'node:console';
import { TTableCategoryData, TTableProductData, TTableUserData } from './types/TableTypes';
import cookieParser from "cookie-parser";
import { TToken } from './types/Token';
import cors from "cors";
import { requireAuth } from './middleware/CookieMiddleware';
import { getMetadata } from '../utils/getMetadata';
import { Prisma } from '../generated/prisma';
import { isSafeUrl } from '../utils/isSafeUrl';
import { addProductLimiter } from './middleware/ProductLimiter';

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
    try {
        const user = (req as any).user;
        const limit = 10;
        const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : null;
        const [products, total] = await Promise.all([
            prismaController.getProductsForUser(user.email, limit, cursor),
            prismaController.countProductsForUser(user.email)
        ]); const nextCursor = products.length === limit ? products[products.length - 1].id : null;
        log('Fetched products for user:', products);
        res.json({ products, nextCursor, total });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        res.status(500).json({ message: 'Could not load your products.' });
    }
});

app.post(`/api/products`, requireAuth, addProductLimiter, async (req, res) => {
    try {
        const user = (req as any).user;
        const body: TTableProductData = req.body;
        if (!isSafeUrl(body.url)) {
            return res.status(400).json({ message: 'Invalid URL.' });
        }
        const existingProduct = await prismaController.findProductByUrl(body.url, user.email);
        if (existingProduct) {
            return res.status(409).json({
                message: 'This URL is already in your collection.'
            });
        }
        const meta = await getMetadata(body.url);
        const imageUrl = meta.image; //TODO store image in S3
        log('Fetched metadata for URL:', meta);
        const product = await prismaController.createProduct(user.email, { ...body, imageUrl });
        log('Created product for user:', product);
        res.json(product);
    } catch (error) {
        console.error('Failed to create product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});

app.get(`/api/healthCheck`, requireAuth, async (req, res) => {
    res.json(true);
});

app.delete(`/api/products/:id`, requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const productId = parseInt(`${req.params.id}`);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        log('Attempting to delete product for user:', user, 'productId:', req.params);
        await prismaController.deleteProduct(productId, user.email);
        res.json(true);
    } catch (error) {
        console.error('Failed to delete product:', error);
        res.status(500).json({ message: 'Failed to delete product.' });
    }

});

app.put(`/api/products/:id`, requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const productId = parseInt(req.params.id as string);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const body: TTableProductData = req.body;
        const product = await prismaController.updateProduct(productId, user.email, body);
        res.json(product);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ message: 'Another product already uses this URL.' });
        }
        res.status(500).json({ message: 'Failed to update product.' });
    }
});

app.get(`/api/products/:id`, requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const productId = parseInt(`${req.params.id}`);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await prismaController.getProduct(productId, user.email);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        log('Fetched product for user:', product);
        res.json(product);
    } catch (error) {
        console.error('Failed to fetch product:', error);
        res.status(500).json({ message: 'Failed to fetch product.' });
    }
});

app.delete('/auth/session', requireAuth, async (req, res) => {
    //TODO add logout flow on frontend side + add login flow without google auth
    await prismaController.deleteSession((req as any).sessionId);
    res.clearCookie('sid');
    res.json(true);
});

app.get(`/api/categories`, requireAuth, async (req, res) => {
    //TODO how many categories do we need?
    try {
        const user = (req as any).user;
        const categories = await prismaController.getCategoriesForUser(user.email);
        log('Fetched categories for user:', categories);
        res.json(categories);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).json({ message: 'Could not load your categories.' });
    }
});

app.post(`/api/categories`, requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const body: TTableCategoryData = req.body;
        const existingCategory = await prismaController.findCategoryByName(body.name, user.email);
        if (existingCategory) {
            return res.status(409).json({
                message: 'This category already exists.'
            });
        }
        const category = await prismaController.createCategory(user.email, body);
        log('Created category for user:', category);
        res.json(category);
    } catch (error) {
        console.error('Failed to create category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(3000, () => {
    console.log(`Server started on ${process.env.API_URL}`);
});