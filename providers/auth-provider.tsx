"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  setTokenCookie,
  removeTokenCookie,
  setUserCookie,
  removeUserCookie,
} from "@/lib/auth";
import type { User, UserLogin, UserRegister } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: UserLogin) => Promise<void>;
  adminLogin: (data: UserLogin) => Promise<void>;
  register: (data: UserRegister) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setUserState(null);
        return;
      }
      const userData = await authService.getMe();
      setUserState(userData);
      setUser(userData);
    } catch {
      setUserState(null);
      removeToken();
      removeUser();
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      const storedUser = getUser();
      if (token && storedUser) {
        setUserState(storedUser as User);
        try {
          const userData = await authService.getMe();
          setUserState(userData);
          setUser(userData);
        } catch {
          removeToken();
          removeUser();
          removeTokenCookie();
          removeUserCookie();
          setUserState(null);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (data: UserLogin) => {
    const response = await authService.login(data);
    setToken(response.access_token);
    localStorage.setItem("refresh_token", response.refresh_token);
    setTokenCookie(response.access_token);
    setUser(response.user);
    setUserCookie(response.user);
    setUserState(response.user);
    toast.success("Connexion réussie !");

    const dashPath: Record<string, string> = {
      chauffeur: "/dashboard/chauffeur",
      proprietaire: "/dashboard/proprietaire",
      mecanicien: "/dashboard/mecanicien",
      admin: "/dashboard/admin",
    };
    router.push(dashPath[response.user.role] || "/dashboard");
  };

  const adminLogin = async (data: UserLogin) => {
    const response = await authService.adminLogin(data);
    setToken(response.access_token);
    localStorage.setItem("refresh_token", response.refresh_token);
    setTokenCookie(response.access_token);
    setUser(response.user);
    setUserCookie(response.user);
    setUserState(response.user);
    toast.success("Connexion administrateur réussie !");
    router.push("/dashboard/admin");
  };

  const register = async (data: UserRegister) => {
    const response = await authService.register(data);
    setUser(response);
    toast.success("Inscription réussie ! Vous pouvez vous connecter.");
    router.push("/login");
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    removeToken();
    removeUser();
    removeTokenCookie();
    removeUserCookie();
    localStorage.removeItem("refresh_token");
    setUserState(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
