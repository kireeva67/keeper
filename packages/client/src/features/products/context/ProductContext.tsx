import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Product } from '../../../shared/types/ProductType';
import { ProductContext } from '../api/useProducts';
import { type Category } from '../../../shared/types/CategoryType';
import { getProducts } from '../api/getProducts';

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [categoriesIds, setCategories] = useState<number[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const loadingRef = useRef(false);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        await fetchProducts(categoriesIds, cursor, true);
    }, [cursor, hasMore, categoriesIds]);

    useEffect(() => {
        loadMore();
    }, []);

    const reload = useCallback(async (ids: number[]) => {
        if (loadingRef.current) return;
        await fetchProducts(ids, null, false);
    }, []);

    const fetchProducts = async (ids: number[], cursor: number | null, append: boolean) => {
        loadingRef.current = true;
        setLoading(true);
        try {
            const { products, nextCursor, total } = await getProducts(ids, cursor);
            setProducts(prev => append ? [...prev, ...products] : products);
            setTotal(total);
            setCursor(nextCursor);
            setHasMore(nextCursor !== null);
        } catch {
            // handled globally
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }

    const setFilter = (ids: number[]) => {
        //TODO set url params
        setCategories(ids);
        reload(ids);
    };

    const updateProductInState = (updated: Product) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    const deleteProductFromState = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        setTotal(prev => prev - 1);
    };

    const addProductToState = (newProduct: Product) => {
        setProducts(prev => [newProduct, ...prev]);
        setTotal(prev => prev + 1);
    };

    const reassignCategoryInState = (fromCategoryId: number, toCategory: Category) => {
        setProducts(prev => prev.map(p =>
            p.category.id === fromCategoryId ? { ...p, category: toCategory } : p
        ));
    };

    return (
        <ProductContext.Provider value={{
            products,
            loading,
            hasMore,
            loadMore,
            total,
            categoriesIds,
            updateProductInState,
            deleteProductFromState,
            addProductToState,
            reassignCategoryInState,
            setFilter
        }}>
            {children}
        </ProductContext.Provider>
    );
};

