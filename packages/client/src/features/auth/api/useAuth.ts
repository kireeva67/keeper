
import { useContext, createContext } from "react";

type AuthCtx = {
    loading: boolean;
    isAuthenticated: boolean;
    setAuthenticated: (v: boolean) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}