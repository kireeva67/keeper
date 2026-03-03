import { http } from "../../../shared/api/http";
import type { Category } from "../../../shared/types/CategoryType";

export async function addCategory(body: Partial<Category>) {
    return await http<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ ...body, }),
    });
}
