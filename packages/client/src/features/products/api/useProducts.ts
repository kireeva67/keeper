import { createContext, useContext } from "react";
import type { Product } from "../../../shared/types/ProductType";
import type { Category } from "../../../shared/types/CategoryType";

type ProductContextType = {
    products: Product[];
    loading: boolean;
    hasMore: boolean;
    total: number;
    categoriesIds: number[];
    loadMore: () => void;
    updateProductInState: (product: Product) => void;
    deleteProductFromState: (id: number) => void;
    addProductToState: (product: Product) => void;
    reassignCategoryInState: (fromCategoryId: number, toCategory: Category) => void;
    setFilter: (ids: number[]) => void;
};

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error("useProducts must be used within a ProductProvider");
    return context;
};