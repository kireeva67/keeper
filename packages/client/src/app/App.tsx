import LoginPage from "../features/auth/pages/LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CenteredLayout from "../shared/components/CenteredLayout";
import SignUpPage from "../features/auth/pages/SignUpPage";
import { LOGIN_ROUTE, PRODUCTS_ROUTE, SIGN_UP_ROUTE } from "../features/auth/config/authURLS";
import ProductsPage from "../features/auth/pages/ProductsPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CenteredLayout />}>
          <Route path={LOGIN_ROUTE} element={<LoginPage />} />
          <Route path={SIGN_UP_ROUTE} element={<SignUpPage />} />
          <Route path={PRODUCTS_ROUTE} element={<ProductsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={LOGIN_ROUTE} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
