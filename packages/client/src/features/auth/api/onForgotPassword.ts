import { http } from "../../../shared/api/http";

export async function onForgotPassword(email: string) {
    return await http<boolean>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}
