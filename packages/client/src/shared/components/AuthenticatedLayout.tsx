import { Outlet } from "react-router-dom";
import { ProductProvider } from "../../features/products/context/ProductContext";

export function AuthenticatedLayout() {
    return (
        <ProductProvider>
            <Outlet />
        </ProductProvider>
    );
}