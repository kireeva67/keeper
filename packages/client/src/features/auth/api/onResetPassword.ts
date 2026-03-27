import { http } from "../../../shared/api/http";

export async function onResetPassword(body: { password: string, token: string | null }) {
    return await http<boolean>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ ...body }),
    });
}
