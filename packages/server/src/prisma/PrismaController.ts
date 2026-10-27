import { prisma } from './prisma'
import { TokenUtil } from '../token/TokenUtil';
import { TTableCategoryData, TTableProductData, TToken } from '../types/Types';
import { PasswordResetTokenUtil } from '../token/PasswordResetTokenUtil';
import { ValidationError } from '../error/ValidationError';

export class PrismaController {

    public async getUser(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    public async upsertUser(email: string, password: string) {
        return await prisma.user.upsert({
            where: { email },
            create: { email, password },
            update: {}
        });
    }

    public async createSession(email: string): Promise<TToken> {
        const token = TokenUtil.createToken();
        try {
            await prisma.session.create({
                data: {
                    token: token.hashed,
                    validTo: token.validTo,
                    user: {
                        connect: { email: email }
                    }
                },
            });

            const user = await prisma.user.findUnique({
                where: { email },
                select: { id: true }
            });

            if (user) {
                const sessions = await prisma.session.findMany({
                    where: { userId: user.id },
                    orderBy: { createdAt: 'desc' },
                    skip: 5, //skipping the most recent 5 sessions
                });

                if (sessions.length > 0) {
                    await prisma.session.deleteMany({
                        where: { id: { in: sessions.map(s => s.id) } }
                    });
                }
            }

            return token;
        } catch (error) {
            throw new Error("Could not create session. User may not exist.");
        }
    }

    public async createResetPasswordToken(email: string): Promise<TToken> {
        const token = PasswordResetTokenUtil.createToken();
        try {
            await prisma.user.update({
                where: { email },
                data: {
                    passwordResetToken: token.hashed,
                    passwordResetExpiry: token.validTo
                }
            });
            return token;
        } catch {
            throw new Error("Could not create reset token.");
        }
    }

    public async isValidPasswordReset(rawToken: string) {
        const hashed = TokenUtil.hashIdSha256Base64Url(rawToken);
        return prisma.user.findFirst({
            where: {
                passwordResetToken: hashed,
                passwordResetExpiry: { gt: new Date() },
            },
        });
    }

    public async findValidSession(rawToken: string) {
        const hashed = TokenUtil.hashIdSha256Base64Url(rawToken);
        return prisma.session.findFirst({
            where: {
                token: hashed,
                validTo: { gt: new Date() }, //grater than now
            },
            include: { user: true },
        });
    }

    public async getProductsForUser(email: string, limit: number, cursor: number | null, categoryIds: number[]) {
        return await prisma.product.findMany({
            where: {
                user: {
                    email: email
                },
                ...(categoryIds.length > 0 && {
                    categoryId: { in: categoryIds }
                })
            },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor }
            }),
            orderBy: { id: 'desc' },
            include: { category: true }
        });
    }

    public async countProductsForUser(email: string, categoryIds: number[]) {
        return await prisma.product.count({
            where: {
                user: {
                    email: email
                },
                ...(categoryIds.length > 0 && {
                    categoryId: { in: categoryIds }
                })
            }
        });
    }

    // A category is usable if it is a system default (userId null) or belongs to the user.
    private async assertCategoryAvailable(categoryId: number, email: string) {
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                OR: [{ userId: null }, { user: { email } }]
            },
            select: { id: true }
        });
        if (!category) {
            throw new ValidationError('Category not found.');
        }
    }

    public async createProduct(email: string, data: TTableProductData) {
        await this.assertCategoryAvailable(data.categoryId, email);
        return await prisma.product.create({
            data: {
                user: { connect: { email: email } },
                title: data.title,
                description: data.description || "",
                url: data.url,
                imageUrl: data.imageUrl,
                category: { connect: { id: data.categoryId } }
            },
            include: { category: true },
        });
    }

    public async deleteProduct(id: number, email: string) {
        return await prisma.product.delete({
            where: {
                id: id,
                user: {
                    email: email
                }
            },
        });
    }

    public async updateProduct(id: number, email: string, data: TTableProductData) {
        await this.assertCategoryAvailable(data.categoryId, email);
        return await prisma.product.update({
            where: {
                id: id,
                user: {
                    email: email
                }
            },
            data: {
                title: data.title,
                description: data.description || "",
                category: { connect: { id: data.categoryId } },
            },
            include: { category: true },
        });
    }

    public async getProduct(id: number, email: string) {
        return await prisma.product.findFirst({
            where: {
                id: id,
                user: {
                    email: email
                }
            },
            include: { category: true },
        });
    }

    public async findProductByUrl(url: string, email: string) {
        return await prisma.product.findFirst({
            where: {
                url,
                user: {
                    email: email
                }

            }
        });
    }

    public async deleteSession(id: number) {
        return await prisma.session.delete({ where: { id } });
    }

    public async getCategoriesForUser(email: string) {
        return await prisma.category.findMany({
            where: {
                OR: [
                    { userId: null },
                    { user: { email: email } }
                ]
            },
            include: {
                _count: {
                    select: {
                        products: {
                            where: { user: { email } }
                        }
                    }
                }
            }
        });
    }

    public async findCategoryByName(name: string, email: string) {
        return await prisma.category.findFirst({
            where: {
                name,
                user: {
                    email: email
                }

            }
        });
    }

    public async createCategory(email: string, data: TTableCategoryData) {
        return await prisma.category.create({
            data: {
                name: data.name,
                color: data.color,
                user: { connect: { email: email } },
            },
        });
    }

    public async deleteCategory(id: number, email: string) {
        const owned = await prisma.category.findFirst({
            where: { id, user: { email } },
            select: { id: true }
        });
        if (!owned) {
            throw new ValidationError('Category not found.');
        }
        await prisma.$transaction([
            prisma.product.updateMany({
                where: { categoryId: id, user: { email } },
                data: { categoryId: 1 },
            }),
            prisma.category.delete({
                where: { id, user: { email } },
            }),
        ]);
    }

    public async countCustomCategoriesForUser(email: string) {
        return await prisma.category.count({
            where: { user: { email } }
        });
    }

    public async updatePassword(email: string, password: string) {
        return await prisma.user.update({
            where: { email },
            data: { password },
        });
    }

    public async findUser(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    public async deleteUser(email: string) {
        return await prisma.user.delete({
            where: { email }
        });
    }

    public async clearResetToken(email: string) {
        return await prisma.user.update({
            where: {
                email
            },
            data: {
                passwordResetToken: null,
                passwordResetExpiry: null,
            }
        });
    }
}

export const prismaController = new PrismaController();
