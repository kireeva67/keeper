import { http } from "../../../shared/api/http";
import type { Product } from "../../../shared/types/ProductType";

export async function getProducts(): Promise<Product[]> {
    return await http<Product[]>("/api/products");
}
