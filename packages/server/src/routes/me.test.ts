import request from "supertest";
import { prismaController } from "../prisma/PrismaController";
import { app } from "../app";
import { requireAuth } from "../middleware/CookieMiddleware";
import { getPasswordError, validateNewPassword } from "../utils/password";

const mockedUser = { id: 7, email: 'test@example.com', password: 'ValidPass1!', passwordResetToken: 'secret' };

vi.mock('../prisma/PrismaController', () => ({
    prismaController: {
        deleteUser: vi.fn(),
        findUser: vi.fn(),
        updatePassword: vi.fn()
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

describe('GET /api/me', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 if not authenticated', async () => {
        vi.mocked(requireAuth).mockImplementationOnce((_req: any, res: any, _next: any) => {
            res.status(401).json({ error: 'Unauthorized' });
            return Promise.resolve(undefined);
        });
        const res = await request(app).get('/api/me');
        expect(res.status).toBe(401);
    });

    it('returns user email + hasPassword flag', async () => {
        const res = await request(app).get('/api/me');
        expect(res.body).toEqual({ id: 7, email: mockedUser.email, hasPassword: true });
    });
})

describe('DELETE /api/me', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deletes user, clears sid cookie, returns true', async () => {
        const res = await request(app).delete('/api/me')
        expect(res.body).toEqual(true);
    });
})

describe('PUT /api/me', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 if current password is wrong', async () => {
        vi.mocked(getPasswordError).mockResolvedValueOnce('Current password is incorrect');
        const res = await request(app).put('/api/me')
            .send({ currentPassword: 'ValidPass1!', newPassword: 'NewValidPass1!' })
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Current password is incorrect' });
    });

    it('returns 400 if new password fails validation', async () => {
        vi.mocked(validateNewPassword).mockReturnValueOnce('Password must be at least 8 characters');
        const res = await request(app).put('/api/me')
            .send({ currentPassword: 'ValidPass1!', newPassword: 'NewValidPass1!' })
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Password must be at least 8 characters' });
    });

    it('returns true on success', async () => {
        vi.mocked(prismaController.updatePassword).mockResolvedValueOnce(mockedUser as any);
        const res = await request(app).put('/api/me')
            .send({ currentPassword: 'ValidPass1!', newPassword: 'NewValidPass1!' })
        expect(res.body).toEqual(true);
    })
})