import { http } from "../../../shared/api/http";
import type { Product } from "../../../shared/types/ProductType";

export async function updateProduct(id: number, body: Partial<Product>) {
    return await http<Product>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}