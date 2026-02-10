import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LOGIN_ROUTE } from "../config/authURLS";
import { useAuth } from "../api/useAuth";

export function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to={LOGIN_ROUTE} replace state={{ from: location }} />; //TODO use from to get basck after login complete
    }

    return <Outlet />;
}