import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Product } from '../../../shared/types/ProductType';
import { ProductContext } from '../api/useProducts';
import { type Category, CATEGORY_ID } from '../../../shared/types/CategoryType';
import { getProducts } from '../api/getProducts';
import { getCategoriesForUser } from '../api/getCategories';
import { http } from '../../../shared/api/http';
import { useSearchParams } from 'react-router-dom';

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const loadingRef = useRef(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [categoriesIds, setCategoriesIds] = useState<number[]>(() =>
        searchParams.getAll('category').map(Number)
    );
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        getCategoriesForUser().then(setCategories).catch(() => {});
    }, []);

    const addCategory = (category: Category) => {
        setCategories(prev => [...prev, { ...category, _count: { products: 0 } }]);
    };

    const deleteCategory = async (id: number) => {
        const success = await http(`/api/categories/${id}`, { method: 'DELETE' });
        if (success) setCategories(prev => prev.filter(c => c.id !== id));
    };

    const otherCategory = () => categories.find(c => c.id === CATEGORY_ID.Other);
    const customCategories = categories.filter(c => c.userId);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        await fetchProducts(categoriesIds, cursor, true);
    }, [cursor, hasMore, categoriesIds]);

    useEffect(() => {
        fetchProducts(categoriesIds, null, false);
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
        setSearchParams(ids.length ? { category: ids.map(String) } : {});
        setCategoriesIds(ids);
        reload(ids);
    };

    const updateProductInState = useCallback((updated: Product) => {
        if (categoriesIds.length === 0 || categoriesIds.includes(updated.category.id)) {
            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        } else {
            setProducts(prev => prev.filter(p => p.id !== updated.id));
            setTotal(prev => prev - 1);
        }
    }, [categoriesIds]);


    const deleteProductFromState = (id: number) => {
        const product = products.find(p => p.id === id);
        setProducts(prev => prev.filter(p => p.id !== id));
        setTotal(prev => prev - 1);
        if (product) {
            setCategories(prev => prev.map(c =>
                c.id === product.category.id
                    ? { ...c, _count: { products: Math.max(0, (c._count?.products ?? 1) - 1) } }
                    : c
            ));
        }
    };

    const addProductToState = useCallback((newProduct: Product) => {
        if (categoriesIds.length === 0 || categoriesIds.includes(newProduct.category.id)) {
            setProducts(prev => [newProduct, ...prev]);
            setTotal(prev => prev + 1);
        }
        setCategories(prev => prev.map(c =>
            c.id === newProduct.category.id
                ? { ...c, _count: { products: (c._count?.products ?? 0) + 1 } }
                : c
        ));
    }, [categoriesIds]);

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
            setFilter,
            categories,
            addCategory,
            deleteCategory,
            otherCategory,
            customCategories,
        }}>
            {children}
        </ProductContext.Provider>
    );
};

