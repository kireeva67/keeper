import { API_URL } from "../../../shared/api/http";

export async function checkAuth(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/api/healthCheck`, { credentials: "include" });
        return res.ok;
    } catch {
        return false;
    }
}
