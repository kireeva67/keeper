import request from "supertest";
import { prismaController } from "../prisma/PrismaController";
import { app } from "../app";

const mockedUser = { email: 'test@example.com', password: 'ValidPass1!' };

vi.mock('../prisma/PrismaController', () => ({
    prismaController: {
        findCategoryByName: vi.fn(),
        createCategory: vi.fn(),
        deleteCategory: vi.fn()
    }
}));

vi.mock('../middleware/CookieMiddleware', () => ({
    requireAuth: vi.fn((req: any, _res: any, next: () => void) => {
        req.user = { ...mockedUser };
        req.sessionId = 1;
        next();
    })
}));

describe('POST /api/categories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 409 if category name already exists', async () => {
        vi.mocked(prismaController.findCategoryByName).mockResolvedValueOnce({ name: 'test', email: mockedUser.email } as any);
        const res = await request(app).post('/api/categories')
            .send({ name: 'test', email: mockedUser.email });
        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'This category already exists.' });
    });

    it('returns category on success', async () => {
        vi.mocked(prismaController.findCategoryByName).mockResolvedValueOnce(undefined as any);
        vi.mocked(prismaController.createCategory).mockResolvedValueOnce({ name: 'test', email: mockedUser.email } as any);
        const res = await request(app).post('/api/categories')
            .send({ name: 'test', email: mockedUser.email });
        expect(res.body).toEqual({ name: 'test', email: mockedUser.email });
    });
})

describe('DELETE /api/categories/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 for non-numeric ID', async () => {
        const res = await request(app).delete('/api/categories/abs')
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid category ID' });
    });

    it('returns true on success', async () => {
        vi.mocked(prismaController.deleteCategory).mockResolvedValueOnce({ categoryId: 111 } as any);
        const res = await request(app).delete('/api/categories/11')
        expect(res.body).toEqual(true);
    });
})