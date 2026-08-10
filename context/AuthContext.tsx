'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface User {
  name: string;
  email: string;
}

interface AuthContextValue {x
  isAuthEnabled: boolean;
  user: User | null;
  authToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  toggleAuthEnabled: () => void;
  authGate: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_TOKEN_KEY = 'homelab-admin-token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  // isAuthEnabled default can be overridden by environment or localStorage key
  const envDefault = typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_AUTH_ENABLED === 'true';
  const localOverride = typeof window !== 'undefined' ? window.localStorage.getItem('homelab-isAuthEnabled') : null;
  const initialAuthEnabled = localOverride ? localOverride === 'true' : Boolean(envDefault);
  const [isAuthEnabled, setIsAuthEnabled] = useState<boolean>(initialAuthEnabled);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
    if (storedToken) {
      setAuthToken(storedToken);
      setUser({ name: 'Google Admin', email: 'admin@homelab.local' });
    } else if (!isAuthEnabled) {
      setUser({ name: 'Local Admin', email: 'admin@homelab.local' });
    }
  }, [isAuthEnabled]);

  const login = (token: string) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    setAuthToken(token);
    setUser({ name: 'Google Admin', email: 'admin@homelab.local' });
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    setAuthToken(null);
    setUser(isAuthEnabled ? null : { name: 'Local Admin', email: 'admin@homelab.local' });
  };

  const toggleAuthEnabled = () => {
    setIsAuthEnabled((current) => {
      const next = !current;
      try {
        if (typeof window !== 'undefined') window.localStorage.setItem('homelab-isAuthEnabled', String(next));
      } catch {}
      return next;
    });
  };

  const authGate = useMemo(() => {
    if (!isAuthEnabled) {
      return null;
    }
    if (user) {
      return null;
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-white">Sign in to continue</h2>
          <p className="mt-2 text-sm text-slate-300">
            This app uses Google authentication when auth is enabled. Sign in to load secure homelab features.
          </p>
          <div className="mt-6">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  login(credentialResponse.credential);
                }
              }}
              onError={() => {
                alert('Google sign-in failed.');
              }}
            />
          </div>
          <button
            type="button"
            onClick={toggleAuthEnabled}
            className="mt-6 rounded-2xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
          >
            Disable Auth Gate and Continue
          </button>
        </div>
      </div>
    );
  }, [isAuthEnabled, user]);

  return (
    <AuthContext.Provider value={{ isAuthEnabled, user, authToken, login, logout, toggleAuthEnabled, authGate }}>
      {children}
      {authGate}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
