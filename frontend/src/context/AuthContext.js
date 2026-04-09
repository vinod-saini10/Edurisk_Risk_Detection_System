/**
 * AuthContext.js — Global auth state (JWT token + user info)
 * Step 1: JWT Auth System
 */
import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("edurisk_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const u = sessionStorage.getItem("edurisk_user");
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const login = useCallback((accessToken, userObj) => {
    sessionStorage.setItem("edurisk_token", accessToken);
    sessionStorage.setItem("edurisk_user", JSON.stringify(userObj));

    setToken(accessToken);
    setUser(userObj);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("edurisk_token");
    sessionStorage.removeItem("edurisk_user");

    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
