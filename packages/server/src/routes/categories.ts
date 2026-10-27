import { Router } from "express";
import { requireAuth } from "../middleware/CookieMiddleware";
import { prismaController } from "../prisma/PrismaController";
import { TTableCategoryData } from "../types/Types";
import { ValidationError } from "../error/ValidationError";
import { addCategoryLimiter } from "../middleware/CategoriesLimiter";
import { logger } from "../utils/logger";

export const categoriesRouter = Router();

categoriesRouter.get(`/`, requireAuth, async (req, res) => {
    //TODO how many categories do we need?
    try {
        const user = (req as any).user;
        const categories = await prismaController.getCategoriesForUser(user.email);
        res.json(categories);
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch categories');
        res.status(500).json({ message: 'Could not load your categories.' });
    }
});

categoriesRouter.post(`/`, requireAuth, addCategoryLimiter, async (req, res) => {
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
        res.json(category);
    } catch (error) {
        logger.error({ err: error }, 'Failed to create category');
        res.status(500).json({ message: 'Internal server error' });
    }
});

categoriesRouter.delete(`/:id`, requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const categoryId = parseInt(`${req.params.id}`);
        if (isNaN(categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        await prismaController.deleteCategory(categoryId, user.email);
        res.json(true);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(404).json({ message: error.message });
        }
        logger.error({ err: error }, 'Failed to delete category');
        res.status(500).json({ message: 'Failed to delete category.' });
    }
});
