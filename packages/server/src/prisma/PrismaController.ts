import { prisma } from './prisma'
import { TokenUtil } from '../token/TokenUtil';
import { TToken } from '../types/Token';

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

        const existingSession = await prisma.session.findUnique({
            where: { token: token.hashed }
        });

        if (existingSession) {
            return token;
        }
        const user = await this.getUser(email);
        if (!user) {
            throw new Error("User not found");
        }
        const userSessions = await prisma.session.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'asc' }
        });

        if (userSessions.length >= 5) {
            await prisma.session.delete({
                where: { id: userSessions[0].id }
            });
        }

        await prisma.session.create({
            data: { userId: user.id, token: token.hashed, validTo: token.validTo },
        });
        return token;
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
}

export const prismaController = new PrismaController();
