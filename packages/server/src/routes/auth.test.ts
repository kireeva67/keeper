import { prismaController } from "../prisma/PrismaController";
import { app } from "../app";
import request from "supertest";
import { getPasswordError, validateNewPassword } from "../utils/password";
import { requireAuth } from "../middleware/CookieMiddleware";

const mockedUser = { email: 'test@example.com', password: 'ValidPass1!' };

vi.mock('../prisma/PrismaController', () => ({
    prismaController: {
        findUser: vi.fn(),
        upsertUser: vi.fn(),
        createSession: vi.fn().mockResolvedValue({ token: 'mock-token', validTo: new Date(Date.now() + 3600000) }),
        deleteSession: vi.fn()
    }
}));

vi.mock('../middleware/CookieMiddleware', () => ({
    requireAuth: vi.fn((req: any, _res: any, next: () => void) => {
        req.user = { ...mockedUser };
        req.sessionId = 1;
        next();
    })
}));

vi.mock('../utils/password', () => ({
    validateNewPassword: vi.fn().mockReturnValue(null),
    getPasswordError: vi.fn().mockResolvedValue(null),
    hashPassword: vi.fn().mockResolvedValue('hashed-password'),
}));

describe('POST /auth/signup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 409 if email already exists', async () => {
        vi.mocked(prismaController.findUser).mockResolvedValueOnce(mockedUser as any);
        const res = await request(app).post('/auth/signup')
            .send({ email: 'test@example.com', password: 'ValidPass1!' });
        expect(res.status).toBe(409);
        expect(res.body).toEqual({ message: 'User with this email already exists.' });
    });

    it('returns 400 if password is invalid', async () => {
        vi.mocked(prismaController.findUser).mockResolvedValueOnce(undefined as any);
        vi.mocked(validateNewPassword).mockReturnValueOnce('Password must be at least 8 characters');
        const res = await request(app).post('/auth/signup')
            .send({ email: 'test@example.com', password: 'short' });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Password must be at least 8 characters' });
    });

    it('sets sid cookie and returns true on successful signup', async () => {
        vi.mocked(prismaController.findUser).mockResolvedValueOnce(undefined as any);
        const res = await request(app).post('/auth/signup')
            .send({ email: 'test@example.com', password: 'ValidPass1!' });
        expect(res.body).toEqual(true);
        expect(res.headers['set-cookie']).toBeDefined();
    });
});


describe('POST /auth/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 if user not found', async () => {
        vi.mocked(prismaController.findUser).mockResolvedValueOnce(undefined as any);
        const res = await request(app).post('/auth/login')
            .send({ email: 'test@example.com', password: 'ValidPass1!' });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    it('returns 400 if password is incorrect', async () => {
        vi.mocked(prismaController.findUser).mockResolvedValueOnce(mockedUser as any);
        vi.mocked(getPasswordError).mockResolvedValueOnce('Current password is incorrect');
        const res = await request(app).post('/auth/login')
            .send({ email: 'test@example.com', password: 'InvalidPass1!' });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    it('sets sid cookie and returns true on successful login', async () => {
        vi.mocked(prismaController.findUser).mockResolvedValueOnce(mockedUser as any);
        const res = await request(app).post('/auth/login')
            .send({ email: 'test@example.com', password: 'ValidPass1!' });
        expect(res.body).toEqual(true);
        expect(res.headers['set-cookie']).toBeDefined();
    });
});

describe('DELETE /auth/session', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('clears sid cookie and returns true on success', async () => {
        vi.mocked(prismaController.deleteSession).mockResolvedValueOnce({ sessionId: 1 } as any);
        const res = await request(app).delete('/auth/session');
        expect(res.body).toEqual(true);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 401 if no cookie', async () => {
        vi.mocked(requireAuth).mockImplementationOnce((_req: any, res: any, _next: any) => {
            res.status(401).json({ error: 'Unauthorized' });
            return Promise.resolve(undefined);
        });
        const res = await request(app).delete('/auth/session');
        expect(res.status).toBe(401);
        expect(res.headers['set-cookie']).toBeUndefined();
    });
})