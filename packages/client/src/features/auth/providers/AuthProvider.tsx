import React, { useEffect, useMemo, useState } from "react";
import { checkAuth } from "../api/checkAuth";
import { AuthContext } from "../api/useAuth";
import { http } from "../../../shared/api/http";


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const isAuthenticated = await checkAuth();
      setAuthenticated(isAuthenticated);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await http(`/auth/session`, { method: "DELETE" });
    } catch {
      // session may already be expired or the fetch aborted by navigation
    }
    setAuthenticated(false);
  }

  useEffect(() => {
    refresh(); // once on mount
  }, []);

  const value = useMemo(
    () => ({ loading, isAuthenticated, setAuthenticated, logout }),
    [loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
