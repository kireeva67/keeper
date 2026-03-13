import { http } from "../../../shared/api/http";

export async function checkAuth(): Promise<boolean> {
    try {
        await http("/api/healthCheck");
        return true;
    } catch {
        return false;
    }
}
