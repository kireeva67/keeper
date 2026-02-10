import React, { useEffect, useMemo, useState } from "react";
import { checkAuth } from "../api/checkAuth";
import { AuthContext } from "../api/useAuth";


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

  function logout() {
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
