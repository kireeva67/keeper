import { normalizeEmail } from "./normalizeEmail";

describe('normalizeEmail', () => {
    it('lowercases and trims', () => {
        expect(normalizeEmail('  A@Example.COM ')).toBe('a@example.com');
    });

    it('leaves non-strings untouched', () => {
        expect(normalizeEmail(undefined as any)).toBeUndefined();
    });
});
