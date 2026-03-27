import { TokenUtil } from "./TokenUtil";

export class PasswordResetTokenUtil extends TokenUtil {
    protected static SESSION_TTL_MS = 1000 * 60 * 10; // 10 min
}
