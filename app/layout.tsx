import type { ReactNode } from 'react';
import './globals.css';
import Providers from './providers';
import NavBar from '../components/NavBar';
import BottomAudioPlayer from '../components/BottomAudioPlayer';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';

export const metadata = {
  title: 'Homelab Music Player',
  description: 'Responsive mobile-first homelab music player with offline support.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen pb-32">
            <NavBar />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <ServiceWorkerRegistration />
          </div>
          <BottomAudioPlayer />
        </Providers>
      </body>
    </html>
  );
}
