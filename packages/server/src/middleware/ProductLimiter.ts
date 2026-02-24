import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const addProductLimiter = rateLimit({
    windowMs: 60 * 1000,   // 1 minute window
    limit: 10,              // max 10 new products per minute per user
    keyGenerator: (req) => (req as any).user?.email ?? ipKeyGenerator(req.ip ?? ''),
    handler: (_req, res) => {
        res.status(429).json({ message: 'Too many requests. Slow down.' });
    }
});