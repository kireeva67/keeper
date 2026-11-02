import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../features/auth/providers/AuthProvider";
import { AppRoutes, UnauthorizedBridge } from "./roots/AppRoots";
import { SnackbarProvider } from "../shared/snackbar/SnackbarProvider";

export default function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <AuthProvider>
          <UnauthorizedBridge />
          <AppRoutes />
        </AuthProvider>
      </SnackbarProvider>
    </BrowserRouter>
  );
}
