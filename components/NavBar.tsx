'use client';

import Link from 'next/link';
import { ArrowRight, CloudOff, Music2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NavBar() {
  const { isAuthEnabled, user } = useAuth();
  const { isOffline } = useNetworkStatus();

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-slate-100">
          <Music2 className="h-7 w-7 text-sky-400" />
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Homelab Player</p>
            <p className="text-lg font-semibold">Mobile-first music manager</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200">
          <Link href="/" className="rounded-2xl px-4 py-2 transition hover:bg-slate-800/80">
            Library
          </Link>
          <Link href="/playlists" className="rounded-2xl px-4 py-2 transition hover:bg-slate-800/80">
            Playlists
          </Link>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/80 px-4 py-2 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-sky-300" />
            {isAuthEnabled ? 'Auth Gate On' : 'Auth Bypass'}
          </div>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pb-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          {isOffline && (
            <>
              <CloudOff className="h-4 w-4 text-rose-400" />
              Offline Mode enabled
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{user ? user.name : 'Guest user'}</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span>{isOffline ? 'Cached playback only' : 'Live homelab connection'}</span>
        </div>
      </div>
    </header>
  );
}
