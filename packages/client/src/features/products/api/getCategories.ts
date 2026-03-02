import { http } from "../../../shared/api/http";
import type { Category } from "../../../shared/types/CategoryType";

export async function getCategoriesForUser(): Promise<Category[]> {
    return await http<Category[]>(`/api/categories`);
}