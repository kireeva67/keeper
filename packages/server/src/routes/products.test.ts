import { Prisma } from "../../generated/prisma";
import { app } from "../app";
import { prismaController } from "../prisma/PrismaController";
import { isSafeUrl } from "../utils/isSafeUrl";
import request from "supertest";

const mockedUser = { email: 'test@example.com', password: 'ValidPass1!' };

vi.mock('../prisma/PrismaController', () => ({
    prismaController: {
        findProductByUrl: vi.fn(),
        createProduct: vi.fn(),
        deleteProduct: vi.fn(),
        updateProduct: vi.fn()
    }
}));

vi.mock('../middleware/CookieMiddleware', () => ({
    requireAuth: vi.fn((req: any, _res: any, next: () => void) => {
        req.user = { ...mockedUser };
        req.sessionId = 1;
        next();
    })
}));

vi.mock('../utils/isSafeUrl', () => ({
    isSafeUrl: vi.fn(),
}));

vi.mock('../utils/getMetadata', () => ({
    getMetadata: vi.fn().mockResolvedValue({ image: null }),
}));

vi.mock('../middleware/ProductLimiter', () => ({
    addProductLimiter: vi.fn((_req: any, _res: any, next: () => void) => next()),
}));


describe('POST /api/products', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 if URL is unsafe', async () => {
        vi.mocked(isSafeUrl).mockReturnValueOnce(false);
        const res = await request(app).post('/api/products')
            .send({ url: "http://localhost", email: mockedUser.email });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid URL.' });
    });

    it('returns 409 if URL already in collection', async () => {
        vi.mocked(isSafeUrl).mockReturnValueOnce(true);
        vi.mocked(prismaController.findProductByUrl).mockResolvedValueOnce({ email: mockedUser.email, url: "http://test" } as any);
        const res = await request(app).post('/api/products')
            .send({ url: "http://test", email: mockedUser.email });
        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'This URL is already in your collection.' });
    });

    it('returns created product on success', async () => {
        vi.mocked(isSafeUrl).mockReturnValueOnce(true);
        vi.mocked(prismaController.findProductByUrl).mockResolvedValueOnce(undefined as any);
        vi.mocked(prismaController.createProduct).mockResolvedValueOnce({ url: "http://test", email: mockedUser.email } as any);
        const res = await request(app).post('/api/products')
            .send({ url: "http://test", email: mockedUser.email });
        expect(res.body).toEqual({ url: "http://test", email: mockedUser.email });
    })
})

describe('DELETE /api/products/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 for non-numeric ID', async () => {
        const res = await request(app).delete('/api/products/abs')
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid product ID' });
    });

    it('returns true on success', async () => {
        vi.mocked(prismaController.deleteProduct).mockResolvedValueOnce({ categoryId: 111 } as any);
        const res = await request(app).delete('/api/products/11')
        expect(res.body).toEqual(true);
    });
})

describe('PUT /api/products/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 409 if URL conflicts with another product', async () => {
        vi.mocked(prismaController.updateProduct).mockRejectedValueOnce(
            new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '5' })
        );
        const res = await request(app).put('/api/products/11')
            .send({ url: "http://test", email: mockedUser.email })
        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'Another product already uses this URL.' });
    });

    it('returns updated product on success', async () => {
        vi.mocked(prismaController.updateProduct).mockResolvedValueOnce({ url: "http://test", email: mockedUser.email } as any);
        const res = await request(app).put('/api/products/11')
            .send({ url: "http://test", email: mockedUser.email })
        expect(res.body).toEqual({ url: "http://test", email: mockedUser.email });
    })
})