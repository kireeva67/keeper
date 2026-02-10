import LoginPage from "../features/auth/pages/LoginPage";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import CenteredLayout from "../shared/components/CenteredLayout";
import SignUpPage from "../features/auth/pages/SignUpPage";
import { LOGIN_ROUTE, PRODUCTS_NEW_ROUTE, PRODUCTS_ROUTE, SIGN_UP_ROUTE } from "../features/auth/config/authURLS";
import ProductsPage from "../features/products/pages/ProductsPage";
import NewProductDialog from "../features/products/dialog/NewProductDialog";
import type { LocationState } from "../shared/types/LocationType";


function AppRoutes() {
  const location = useLocation();
  const state = location.state as LocationState;
  const background = state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route element={<CenteredLayout />}>
          <Route path={LOGIN_ROUTE} element={<LoginPage />} />
          <Route path={SIGN_UP_ROUTE} element={<SignUpPage />} />
          <Route path={PRODUCTS_ROUTE} element={<ProductsPage />} />
          <Route path={PRODUCTS_NEW_ROUTE} element={<NewProductDialog fullPage />} />
        </Route>

        <Route path="*" element={<Navigate to={LOGIN_ROUTE} replace />} />
      </Routes>

      {/* Modal routes */}
      {background && (
        <Routes>
          <Route path={PRODUCTS_NEW_ROUTE} element={<NewProductDialog />} />
        </Routes>
      )}
    </>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
