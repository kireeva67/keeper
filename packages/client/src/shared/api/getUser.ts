import { http } from "./http";
import type { TUser } from "../types/UserType";

export async function getUser(): Promise<TUser> {
    return await http<TUser>(`/api/me`);
}