import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { LocationState } from "../../shared/types/LocationType";
import { useAuth } from "../../features/auth/api/useAuth";
import { useEffect } from "react";
import { setOnUnauthorized } from "../../shared/api/http";
import { LOGIN_ROUTE, PRODUCT_EDIT_ROUTE, PRODUCTS_NEW_ROUTE, PRODUCTS_ROUTE, SETTINGS_ROUTE, SIGN_UP_ROUTE } from "../../features/auth/config/authURLS";
import CenteredLayout from "../../shared/components/CenteredLayout";
import SignUpPage from "../../features/auth/pages/SignUpPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../../features/auth/routes/ProtectedRoute";
import ProductsPage from "../../features/products/pages/ProductsPage";
import NewProductDialog from "../../features/products/dialog/NewProductDialog";
import { ScrollContentLayout } from "../../shared/components/ScrollableContentLayout";
import EditProductDialog from "../../features/products/dialog/EditProductDialog";
import SettingsPage from "../../features/settings/pages/SettingsPage";
import { AuthenticatedLayout } from "../../shared/components/AuthenticatedLayout";

export function UnauthorizedBridge() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        setOnUnauthorized(() => {
            setOnUnauthorized(null); // prevent re-entry from logout's own DELETE call
            logout();
            navigate(LOGIN_ROUTE, { replace: true });
        });

        return () => setOnUnauthorized(null);
    }, [logout, navigate]);

    return null;
}


export function AppRoutes() {
    const location = useLocation();
    const state = location.state as LocationState;
    const background = state?.background;

    return (
        <>
            <Routes location={background || location}>
                <Route element={<CenteredLayout />} >
                    <Route path={LOGIN_ROUTE} element={<LoginPage />} />
                    <Route path={SIGN_UP_ROUTE} element={<SignUpPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route element={<AuthenticatedLayout />}>
                        <Route element={<ScrollContentLayout />} >
                            <Route path={PRODUCTS_ROUTE} element={<ProductsPage />} />
                        </Route>
                        <Route element={<CenteredLayout />} >
                            <Route path={PRODUCTS_NEW_ROUTE} element={<NewProductDialog fullPage />} />
                            <Route path={PRODUCT_EDIT_ROUTE} element={<EditProductDialog />} />
                            <Route path={SETTINGS_ROUTE} element={<SettingsPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to={LOGIN_ROUTE} replace />} />
            </Routes>

            {/* Modal routes */}
            {background && (
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path={PRODUCTS_NEW_ROUTE} element={<NewProductDialog />} />
                        <Route path={PRODUCT_EDIT_ROUTE} element={<EditProductDialog />} />
                    </Route>
                </Routes>
            )}
        </>
    );
}