import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth";

const STORAGE_KEY = "biyahenyo.auth";

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = window.atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  return Date.now() >= payload.exp * 1000;
}

function getStoredAuth() {
  const persistentValue = window.localStorage.getItem(STORAGE_KEY);
  const sessionValue = window.sessionStorage.getItem(STORAGE_KEY);
  const rawValue = persistentValue ?? sessionValue;

  if (!rawValue) {
    return null;
  }

  try {
    const auth = JSON.parse(rawValue);
    // FORCE CLEAR old corrupted sessions that don't have a token (from before the JWT update)
    if (auth && !auth.token) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (auth?.token && isTokenExpired(auth.token)) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return auth;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuth());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      if (!user?.token) {
        if (isActive) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        const profile = await getCurrentUser();
        if (isActive) {
          setUser({
            ...user,
            ...profile,
            token: user.token,
          });
        }
      } catch {
        if (isActive) {
          window.localStorage.removeItem(STORAGE_KEY);
          window.sessionStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      isActive = false;
    };
  }, []);

  const saveUser = (authPayload, rememberMe = true) => {
    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;

    otherStorage.removeItem(STORAGE_KEY);
    storage.setItem(STORAGE_KEY, JSON.stringify(authPayload));
    setUser(authPayload);
    console.info("[Auth] Saved session", {
      email: authPayload?.email,
      role: authPayload?.role,
      hasToken: Boolean(authPayload?.token),
      tokenLength: authPayload?.token?.length ?? 0,
      storage: rememberMe ? "localStorage" : "sessionStorage",
    });
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitializing,
        saveUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
