import { http } from "../../../shared/api/http";
import { HttpError } from "../../../shared/errors/HTTPError";

export async function checkAuth(): Promise<boolean> {
    try {
        await http("/api/healthCheck");
        return true;
    } catch (err) {
        if (err instanceof HttpError && err.status === 401) return false;
        throw err;
    }
}
