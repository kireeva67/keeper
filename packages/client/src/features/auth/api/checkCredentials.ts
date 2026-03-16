import { http } from "../../../shared/api/http";

export async function checkCredentials(body: Partial<{ email: string; password: string }>) {
    return await http<boolean>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ ...body }),
    });
}
