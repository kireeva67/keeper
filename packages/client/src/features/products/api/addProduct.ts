import { http } from "../../../shared/api/http";
import type { Product } from "../../../shared/types/ProductType";

export async function addProduct(body: Partial<Product>) {
    return await http<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(body),
    });
}
