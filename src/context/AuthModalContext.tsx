"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getPublicApiUrl } from "@/lib/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type ModalMode = "login" | "register" | null;

type AuthContextValue = {
  user: AuthUser | null;
  modal: ModalMode;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  authSuccess: (token: string, customer: AuthUser) => void;
  logout: () => void;
};

const TOKEN_KEY = "nautic_auth_token";
const USER_KEY = "nautic_auth_user";

const AuthModalContext = createContext<AuthContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalMode>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const apiBase = getPublicApiUrl();

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !apiBase) {
      setUser(null);
      return;
    }
    try {
      const r = await fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        return;
      }
      const data = (await r.json()) as { customer: AuthUser };
      setUser(data.customer);
      localStorage.setItem(USER_KEY, JSON.stringify(data.customer));
    } catch {
      setUser(null);
    }
  }, [apiBase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as AuthUser);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    refreshUser();
  }, [refreshUser]);

  const authSuccess = useCallback((token: string, customer: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(customer));
    setUser(customer);
    setModal(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setModal(null);
  }, []);

  const openLogin = useCallback(() => setModal("login"), []);
  const openRegister = useCallback(() => setModal("register"), []);
  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo(
    () =>
      ({
        user,
        modal,
        openLogin,
        openRegister,
        closeModal,
        authSuccess,
        logout,
      }) satisfies AuthContextValue,
    [user, modal, openLogin, openRegister, closeModal, authSuccess, logout],
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}
