import { createContext, useContext } from "react";
import type { Product } from "../../../shared/types/ProductType";

type ProductContextType = {
    products: Product[];
    loading: boolean;
    refresh: () => Promise<void>;
    updateProductInState: (product: Product) => void;
    deleteProductFromState: (id: number) => void;
    addProductToState: (product: Product) => void;
};

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error("useProducts must be used within a ProductProvider");
    return context;
};