import { http } from "../../../shared/api/http";
import type { TUser } from "../../../shared/types/UserType";

export async function addUser(body: Partial<TUser>) {
    return await http<TUser>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ ...body }),
    });
}
