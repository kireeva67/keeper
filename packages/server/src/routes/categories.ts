import { log } from "console";
import { Router } from "express";
import { requireAuth } from "../middleware/CookieMiddleware";
import { prismaController } from "../prisma/PrismaController";
import { TTableCategoryData } from "../types/Types";
import { addCategoryLimiter } from "../middleware/CategoriesLimiter";

export const categoriesRouter = Router();

categoriesRouter.get(`/`, requireAuth, async (req, res) => {
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
        log('Created category for user:', category);
        res.json(category);
    } catch (error) {
        console.error('Failed to create category:', error);
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
        log('Attempting to delete category for user:', user, 'categoryId:', req.params);
        await prismaController.deleteCategory(categoryId, user.email);
        res.json(true);
    } catch (error) {
        console.error('Failed to delete category:', error);
        res.status(500).json({ message: 'Failed to delete category.' });
    }
});
