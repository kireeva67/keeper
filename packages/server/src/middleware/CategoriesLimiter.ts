import { prismaController } from '../prisma/PrismaController';

const CATEGORY_LIMIT = 20;

export async function addCategoryLimiter(req: any, res: any, next: () => void) {
    const count = await prismaController.countCustomCategoriesForUser(req.user.email);
    if (count >= CATEGORY_LIMIT) {
        return res.status(429).json({ message: 'Categories limit reached.' });
    }
    next();
}
