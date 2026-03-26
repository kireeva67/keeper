import { http } from "../../../shared/api/http";
import type { Product } from "../../../shared/types/ProductType";

export async function getProducts(ids: number[], cursor?: number | null): Promise<{ products: Product[], nextCursor: number | null, total: number }> {
    return await http<{ products: Product[]; nextCursor: number | null; total: number }>(
        `/api/products?${cursor ? `cursor=${cursor}&` : ''}${ids.length ? `categoryIds=${ids.join(',')}` : ''}`);
}