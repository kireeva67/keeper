import { http } from "../../../shared/api/http";
import type { Product } from "../../../shared/types/ProductType";

export async function editProduct(id: number, body: Partial<Product>) {
    await http<Product>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}