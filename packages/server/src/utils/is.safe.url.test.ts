import { isSafeUrl } from './isSafeUrl';

describe('isSafeUrl', () => {
    it('accepts HTTPS URLs', () => {
        expect(isSafeUrl('https://example.com')).toBe(true);
    });
    it('accepts HTTP URLs', () => {
        expect(isSafeUrl('http://example.com')).toBe(true);
    });
    it('returns false for a URL with an unsafe protocol', () => {
        expect(isSafeUrl('ftp://example.com')).toBe(false);
    });
    it('returns false for a URL with an blocked hostname', () => {
        expect(isSafeUrl('http://localhost:5173/login')).toBe(false);
    });
    it('returns false for a 127.0.0.1 private IP', () => {
        expect(isSafeUrl('http://127.0.0.1:3000')).toBe(false);
    });
    it('returns false for a 10.x.x.x private IP', () => {
        expect(isSafeUrl('http://10.0.0.1/path')).toBe(false);
    });
    it('returns false for a 192.168.x.x private IP', () => {
        expect(isSafeUrl('http://192.168.1.1')).toBe(false);
    });
    it('returns false for a 172.16.x.x private IP', () => {
        expect(isSafeUrl('http://172.16.0.1')).toBe(false);
    });
    it('returns false for a completely invalid string', () => {
        expect(isSafeUrl('not-a-url')).toBe(false);
    });
    it('returns false for an empty string', () => {
        expect(isSafeUrl('')).toBe(false);
    });
});
