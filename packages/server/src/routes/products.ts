import { log } from "console";
import { Router } from "express";
import { requireAuth } from "../middleware/CookieMiddleware";
import { addProductLimiter } from "../middleware/ProductLimiter";
import { prismaController } from "../prisma/PrismaController";
import { TGetProductsQuery, TTableProductData } from "../types/Types";
import { getMetadata } from "../utils/getMetadata";
import { isSafeUrl } from "../utils/isSafeUrl";
import { Prisma } from "../../generated/prisma";

export const productsRouter = Router();

productsRouter.get(`/`, requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const query = req.query as unknown as TGetProductsQuery;
        const limit = 10;
        const cursor = query.cursor ? parseInt(query.cursor as string) : null;
        const categoryIds = query.categoryIds ? query.categoryIds.split(',').map(Number).filter(Boolean) : [];
        const [products, total] = await Promise.all([
            prismaController.getProductsForUser(user.email, limit, cursor, categoryIds),
            prismaController.countProductsForUser(user.email, categoryIds)
        ]); const nextCursor = products.length === limit ? products[products.length - 1].id : null;
        log('Fetched products for user:', products, categoryIds);
        res.json({ products, nextCursor, total });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        res.status(500).json({ message: 'Could not load your products.' });
    }
});

productsRouter.post(`/`, requireAuth, addProductLimiter, async (req, res) => {
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

productsRouter.delete(`/:id`, requireAuth, async (req, res) => {
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

productsRouter.put(`/:id`, requireAuth, async (req, res) => {
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

productsRouter.get(`/:id`, requireAuth, async (req, res) => {
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
