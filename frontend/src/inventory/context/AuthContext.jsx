import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const token = localStorage.getItem("inv_token");
      if (!token) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const me = await authService.getMe();
        if (isMounted) {
          setUser(me);
          localStorage.setItem("inv_user", JSON.stringify(me));
        }
      } catch (error) {
        localStorage.removeItem("inv_token");
        localStorage.removeItem("inv_user");
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("inv_token", data.access_token);
    localStorage.setItem("inv_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("inv_token");
    localStorage.removeItem("inv_user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
