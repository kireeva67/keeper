import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Product } from '../../../shared/types/ProductType';
import { ProductContext } from '../api/useProducts';
import { http } from '../../../shared/api/http';
import { type Category } from '../../../shared/types/CategoryType';

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const loadingRef = useRef(false);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const { products, nextCursor, total } = await http<{ products: Product[]; nextCursor: number | null; total: number }>(
                `/api/products${cursor ? `?cursor=${cursor}` : ''}`);
            setProducts(prev => [...prev, ...products]);
            setTotal(total);
            setCursor(nextCursor);
            setHasMore(nextCursor !== null);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [cursor, hasMore]);

    useEffect(() => {
        loadMore();
    }, []);

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
            updateProductInState,
            deleteProductFromState,
            addProductToState,
            reassignCategoryInState
        }}>
            {children}
        </ProductContext.Provider>
    );
};

