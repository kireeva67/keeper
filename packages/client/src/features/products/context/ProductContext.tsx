import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Product } from '../../../shared/types/ProductType';
import { ProductContext } from '../api/useProducts';
import { type Category, CATEGORY_ID } from '../../../shared/types/CategoryType';
import { getProducts } from '../api/getProducts';
import { getCategoriesForUser } from '../api/getCategories';
import { http } from '../../../shared/api/http';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from '../../../shared/snackbar/useSnackbar';
import { deleteProduct } from '../api/deleteProduct';

function matchesFilter(ids: number[], product: Product) {
    return ids.length === 0 || ids.includes(product.category.id);
}

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [loadError, setLoadError] = useState(false);
    const { showError, showUndo } = useSnackbar();
    const loadingRef = useRef(false);
    const latestRequestRef = useRef(0);
    // Deleted on screen, but the server delete waits until the undo offer ends.
    const pendingDeletesRef = useRef(new Map<number, Product>());
    const [searchParams, setSearchParams] = useSearchParams();
    const [categoriesIds, setCategoriesIds] = useState<number[]>(() =>
        searchParams.getAll('category').map(Number)
    );
    const filterRef = useRef(categoriesIds);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        getCategoriesForUser().then(setCategories)
            .catch(() => showError("Couldn't load your categories. Reload the page to try again."));
    }, [showError]);

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
        // Without a cursor no page has loaded yet (the first load failed), so replace
        // the list instead of appending; this avoids duplicating items added since.
        await fetchProducts(categoriesIds, cursor, cursor !== null);
    }, [cursor, hasMore, categoriesIds]);

    useEffect(() => {
        fetchProducts(categoriesIds, null, false);
    }, []);

    const reload = useCallback(async (ids: number[]) => {
        await fetchProducts(ids, null, false);
    }, []);

    const fetchProducts = async (ids: number[], cursor: number | null, append: boolean) => {
        const requestId = ++latestRequestRef.current;
        const isOutdated = () => requestId !== latestRequestRef.current;
        loadingRef.current = true;
        setLoading(true);
        setLoadError(false);
        try {
            const { products, nextCursor, total } = await getProducts(ids, cursor);
            if (isOutdated()) return;
            const pendingDeletes = pendingDeletesRef.current;
            const shownProducts = products.filter(p => !pendingDeletes.has(p.id));
            const pendingInFilter = [...pendingDeletes.values()].filter(p => matchesFilter(ids, p)).length;
            setProducts(prev => append ? [...prev, ...shownProducts] : shownProducts);
            setTotal(total - pendingInFilter);
            setCursor(nextCursor);
            setHasMore(nextCursor !== null);
        } catch {
            if (isOutdated()) return;
            // A failed first page or filter change leaves nothing stale on screen,
            // so the list can show its Retry state. A failed "Load More" keeps what is loaded.
            if (!append) setProducts([]);
            setLoadError(true);
        } finally {
            if (!isOutdated()) {
                setLoading(false);
                loadingRef.current = false;
            }
        }
    }

    const retry = useCallback(() => {
        reload(categoriesIds);
    }, [reload, categoriesIds]);

    const setFilter = (ids: number[]) => {
        setSearchParams(ids.length ? { category: ids.map(String) } : {});
        setCategoriesIds(ids);
        filterRef.current = ids;
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


    const changeCategoryCount = (categoryId: number, change: number) => {
        setCategories(prev => prev.map(c =>
            c.id === categoryId
                ? { ...c, _count: { products: Math.max(0, (c._count?.products ?? 0) + change) } }
                : c
        ));
    };

    const removeProductFromState = (product: Product) => {
        setProducts(prev => prev.filter(p => p.id !== product.id));
        setTotal(prev => prev - 1);
        changeCategoryCount(product.category.id, -1);
    };

    const restoreProductToState = (product: Product, index: number) => {
        changeCategoryCount(product.category.id, 1);
        if (!matchesFilter(filterRef.current, product)) return;
        setProducts(prev => prev.some(p => p.id === product.id)
            ? prev
            : [...prev.slice(0, index), product, ...prev.slice(index)]);
        setTotal(prev => prev + 1);
    };

    const sendDelete = async (product: Product, index: number) => {
        try {
            await deleteProduct(product.id);
        } catch {
            restoreProductToState(product, index);
            showError("Couldn't delete this item. Please try again.");
        } finally {
            pendingDeletesRef.current.delete(product.id);
        }
    };

    const deleteWithUndo = (product: Product) => {
        const index = products.findIndex(p => p.id === product.id);
        removeProductFromState(product);
        pendingDeletesRef.current.set(product.id, product);
        showUndo("Item deleted", {
            onUndo: () => {
                pendingDeletesRef.current.delete(product.id);
                restoreProductToState(product, index);
            },
            onDismiss: () => sendDelete(product, index),
        });
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
            loadError,
            retry,
            total,
            categoriesIds,
            updateProductInState,
            deleteWithUndo,
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

