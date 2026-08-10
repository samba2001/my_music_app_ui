'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface NetworkStatusContextValue {
  isOnline: boolean;
  isServerReachable: boolean;
  isOffline: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextValue | undefined>(undefined);

export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isServerReachable, setIsServerReachable] = useState(true);

  const checkServer = async () => {
    if (typeof window === 'undefined') return;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const response = await fetch('/api/status', { signal: controller.signal });
      clearTimeout(timeout);
      setIsServerReachable(response.ok);
    } catch {
      setIsServerReachable(false);
    }
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    checkServer();

    const onOnline = () => {
      setIsOnline(true);
      checkServer();
    };
    const onOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    const polling = window.setInterval(() => {
      if (navigator.onLine) checkServer();
    }, 15000);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.clearInterval(polling);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, isServerReachable, isOffline: !isOnline || !isServerReachable }}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within NetworkStatusProvider');
  }
  return context;
}
