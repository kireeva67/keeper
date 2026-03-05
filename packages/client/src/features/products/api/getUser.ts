import { http } from "../../../shared/api/http";
import type { TUser } from "../../../shared/types/UserType";

export async function getUser(): Promise<TUser> {
    return await http<TUser>(`/api/me`);
}