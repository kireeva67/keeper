import { createLogger } from "./logger";

function capture(log: (logger: ReturnType<typeof createLogger>) => void) {
    const lines: string[] = [];
    const logger = createLogger({ level: "info", destination: { write: (line: string) => { lines.push(line); } } });
    log(logger);
    return JSON.parse(lines[0]);
}

describe('logger redaction', () => {
    it('redacts cookies and authorization headers', () => {
        const entry = capture(l => l.info({ req: { headers: { cookie: 'sid=abc', authorization: 'Bearer xyz', host: 'h' } } }, 'req'));
        expect(entry.req.headers.cookie).toBe('[redacted]');
        expect(entry.req.headers.authorization).toBe('[redacted]');
        expect(entry.req.headers.host).toBe('h');
    });

    it('redacts passwords and tokens one level deep', () => {
        const entry = capture(l => l.info({ user: { email: 'a@x.com', password: 'hash', passwordResetToken: 't' }, session: { token: 'sid' } }, 'x'));
        expect(entry.user.password).toBe('[redacted]');
        expect(entry.user.passwordResetToken).toBe('[redacted]');
        expect(entry.session.token).toBe('[redacted]');
        expect(entry.user.email).toBe('a@x.com');
    });
});
