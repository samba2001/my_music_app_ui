'use client';

import type { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../context/AuthContext';
import { NetworkStatusProvider } from '../hooks/useNetworkStatus';
import { AudioProvider } from '../context/AudioContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <AuthProvider>
        <NetworkStatusProvider>
          <AudioProvider>{children}</AudioProvider>
        </NetworkStatusProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
