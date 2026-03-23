import { getPasswordError, validateNewPassword } from "./password";
import bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn(),
    }
}));

describe('getPasswordError', () => {
    it('returns null when there is no stored hash', async () => {
        expect(await getPasswordError(null, undefined)).toBeNull();
    });

    it('returns error when there is hash but no current password', async () => {
        expect(await getPasswordError('storedHash', undefined)).toBe("Current password required");
    });

    it('returns error when password does not match', async () => {
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);
        expect(await getPasswordError('storedHash', 'wrongPassword')).toBe("Current password is incorrect");
    });

    it('returns null when password matches', async () => {
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
        expect(await getPasswordError('storedHash', 'correctPassword')).toBeNull();
    });
});

describe('validateNewPassword', () => {
    it('returns an error for a password that is too short', () => {
        expect(validateNewPassword('short')).toBe('Password must be at least 8 characters');
    });
    it('returns an error for a password that does not contain a number', () => {
        expect(validateNewPassword('longpassword')).toBe('Password must contain a number');
    });
    it('returns an error for a password that does not contain a special character', () => {
        expect(validateNewPassword('longpassword1')).toBe('Password must contain a special character');
    });
    it('does not return an error for a valid password', () => {
        expect(validateNewPassword('longpassword1!')).toBeNull();
    });
});