import { validatePassword } from "./validatePassword";

describe('validatePassword', () => {
    it('returns null for a valid password', () => {
        expect(validatePassword('Secret1!')).toBe(null);
    });

    it('rejects a password shorter than 8 characters', () => {
        expect(validatePassword('Ab1!')).toBe('At least 8 characters');
    });

    it('rejects a password with no number', () => {
        expect(validatePassword('Secret!!')).toBe('Must contain a number');
    });

    it('rejects a password with no special character', () => {
        expect(validatePassword('Secret11')).toBe('Must contain a special character');
    });
});
