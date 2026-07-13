import React, { createContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../config";
import { useGuestSessionContext } from "./GuestSessionContext";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("rw_token"));
  const [isLoading, setIsLoading] = useState(true);
  const { migrateToAccount } = useGuestSessionContext();

  // Validate token on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.error("Auth validation error:", err);
        // Don't logout on network error, but we can't be sure if we're authenticated
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("rw_token", data.token);
    setToken(data.token);
    setUser(data.user);
    
    // Migrate guest data after successful login
    await migrateToAccount(data.token);
    
    return data;
  };

  const signup = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");

    localStorage.setItem("rw_token", data.token);
    setToken(data.token);
    setUser(data.user);
    
    // Migrate guest data after successful signup
    await migrateToAccount(data.token);
    
    return data;
  };

  const logout = () => {
    localStorage.removeItem("rw_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
