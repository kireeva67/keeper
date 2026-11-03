import { http } from "../../../shared/api/http";
import type { Product } from "../../../shared/types/ProductType";

export async function deleteProduct(id: number) {
    return await http<Product>(`/api/products/${id}`, {
        method: "DELETE",
        // Lets the delete finish when the undo offer ends because the tab is closing.
        keepalive: true,
    });
}