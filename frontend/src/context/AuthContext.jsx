import { createContext, useContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("sigif_user");
    const storedToken = sessionStorage.getItem("sigif_token");

    if (stored && storedToken) {
      setUser(JSON.parse(stored));
    }

    setLoading(false);
  }, []);

  async function login(email, password, role) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message);
    }

    const data = await response.json();
    sessionStorage.setItem("sigif_user", JSON.stringify(data.user));
    sessionStorage.setItem("sigif_token", data.token);
    setUser(data.user);
    return data;
  }

  async function register(formData) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message);
    }

    const data = await response.json();
    sessionStorage.setItem("sigif_user", JSON.stringify(data.user));
    sessionStorage.setItem("sigif_token", data.token);
    setUser(data.user);
    return data;
  }

  function updateUser(userData) {
    sessionStorage.setItem("sigif_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem("sigif_user");
    sessionStorage.removeItem("sigif_token");
  }

  const API = API_URL;

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, loading, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return ctx;
}
