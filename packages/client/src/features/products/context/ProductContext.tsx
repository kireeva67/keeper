import React, { useState, useCallback } from 'react';
import type { Product } from '../../../shared/types/ProductType';
import { getProducts as fetchProductsApi } from '../api/getPoducts';
import { ProductContext } from '../api/useProducts';

//TODO use for EDIT< DELETE< CREATE instead of passing handlers down, also add loading and error states to context


export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchProductsApi();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProductInState = (updated: Product) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    const deleteProductFromState = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const addProductToState = (newProduct: Product) => {
        setProducts(prev => [...prev, newProduct]);
    };

    return (
        <ProductContext.Provider value={{
            products,
            loading,
            refresh,
            updateProductInState,
            deleteProductFromState,
            addProductToState
        }}>
            {children}
        </ProductContext.Provider>
    );
};

