'use client';

import TrackSearchLibrary from '../components/TrackSearchLibrary';
import YouTubeDownloader from '../components/YouTubeDownloader';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function HomePage() {
  const { isAuthEnabled, user, toggleAuthEnabled } = useAuth();
  const { isOffline, isServerReachable } = useNetworkStatus();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Homelab Music</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Library & Search</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Browse cached tracks, play offline audio, and queue new YouTube downloader tasks from your homelab backend.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm shadow-soft">
              <p className="font-semibold text-slate-100">Status</p>
              <p className="text-slate-400">Network: {isOffline ? 'Offline' : 'Online'}</p>
              <p className="text-slate-400">API Reachable: {isServerReachable ? 'Yes' : 'No'}</p>
            </div>
            <button
              onClick={toggleAuthEnabled}
              className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              {isAuthEnabled ? 'Disable Auth Bypass' : 'Enable Auth Gate'}
            </button>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              <p>Logged in as: {user?.name ?? 'Guest'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <TrackSearchLibrary />
        </div>
        <div className="space-y-6">
          <YouTubeDownloader />
        </div>
      </div>
    </div>
  );
}
