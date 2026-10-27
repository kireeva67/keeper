import pino, { type DestinationStream } from "pino";

type TLoggerOptions = { level?: string; destination?: DestinationStream };

export function createLogger({ level, destination }: TLoggerOptions = {}) {
    return pino({
        level: level ?? process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "test" ? "silent" : "info"),
        // Defense in depth: request logs already omit headers, but errors and ad-hoc objects might not.
        redact: {
            paths: [
                "req.headers.cookie",
                "req.headers.authorization",
                "res.headers['set-cookie']",
                "*.password",
                "*.token",
                "*.passwordResetToken",
            ],
            censor: "[redacted]",
        },
    }, destination);
}

export const logger = createLogger();
