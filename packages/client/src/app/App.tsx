import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../features/auth/providers/AuthProvider";
import { AppRoutes, UnauthorizedBridge } from "./roots/AppRoots";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UnauthorizedBridge />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
