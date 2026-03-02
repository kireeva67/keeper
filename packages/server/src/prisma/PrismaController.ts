import { prisma } from './prisma'
import { TokenUtil } from '../token/TokenUtil';
import { TToken } from '../types/Token';
import { TTableProductData } from '../types/TableTypes';

export class PrismaController {

    public async getUser(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    public async upsertUser(email: string) {
        return await prisma.user.upsert({
            where: { email },
            create: { email, password: "" },
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

    public async getProductsForUser(email: string, limit: number, cursor: number | null) {
        return await prisma.product.findMany({
            where: {
                user: {
                    email: email
                }
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

    public async countProductsForUser(email: string) {
        return await prisma.product.count({
            where: {
                user: {
                    email: email
                }
            }
        });
    }

    public async createProduct(email: string, data: TTableProductData) {
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
            }
        });
    }
}

export const prismaController = new PrismaController();
