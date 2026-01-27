import { v4 as uuidv4 } from "uuid";
import { createHash } from "node:crypto";
import { TToken } from "../types/Token";

export class TokenUtil {
    // protected static SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 1; // 1 day
    protected static SESSION_TTL_MS = 1000 * 60 * 2; // 2 minutes

    public static createToken(): TToken {
        const token = uuidv4();
        const hashed = this.hashIdSha256Base64Url(token);
        const validTo = new Date(Date.now() + this.SESSION_TTL_MS);
        return { token, hashed, validTo };
    }

    public static hashIdSha256Base64Url(token: string) {
        return createHash("sha256")
            .update(token, "utf8")
            .digest("base64url");
    }
}