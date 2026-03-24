import { http } from "./http";

export async function deleteUser(): Promise<boolean> {
    return await http<boolean>(`/api/me`, {
        method: "DELETE",
    });
}