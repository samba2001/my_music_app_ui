'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, Plus, Download } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export default function TrackSearchLibrary() {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [pending, setPending] = useState(false);
  const [search, setSearch] = useState('');
  const [cachedTracks, setCachedTracks] = useState<Record<string, boolean>>({});
  const { playTrack, addToQueue, currentTrack } = useAudio();
  const { isOffline } = useNetworkStatus();

  useEffect(() => {
    const controller = new AbortController();
    setPending(true);
    fetch(`/api/tracks?q=${encodeURIComponent(search)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setTracks(data.tracks ?? []))
      .catch(() => setTracks([]))
      .finally(() => setPending(false));

    return () => controller.abort();
  }, [search]);

  useEffect(() => {
    async function loadCacheStatus() {
      if (typeof window === 'undefined' || !('caches' in window)) return;
      const cache = await caches.open('homelab-audio-cache');
      const status: Record<string, boolean> = {};
      await Promise.all(tracks.map(async (track) => {
        const response = await cache.match(track.audioUrl);
        status[track.id] = Boolean(response);
      }));
      setCachedTracks(status);
    }

    loadCacheStatus();
  }, [tracks]);

  const handleOfflineDownload = async (track: TrackItem) => {
    if (!('caches' in window)) return;
    const cache = await caches.open('homelab-audio-cache');
    try {
      const response = await fetch(track.audioUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      await cache.put(track.audioUrl, response.clone());
      setCachedTracks((current) => ({ ...current, [track.id]: true }));
      alert(`${track.title} is now available offline.`);
    } catch (error) {
      alert('Unable to cache this audio for offline playback.');
    }
  };

  const trackCount = tracks.length;
  const searchLabel = useMemo(() => (isOffline ? 'Search cached library' : 'Search library by title, artist or lyrics'), [isOffline]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Library</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Search your tracks</h2>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
          {trackCount} tracks available
        </div>
      </div>

      <div className="grid gap-4">
        <label className="block text-sm text-slate-300">
          {searchLabel}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type a track name, artist, or lyric keyword"
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
          />
        </label>
      </div>

      <div className="mt-8 space-y-4">
        {pending && <p className="text-sm text-slate-400">Loading tracks…</p>}
        {tracks.map((track) => (
          <div key={track.id} className="track-card rounded-3xl border border-white/10 bg-slate-900/90 p-4 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{track.title}</p>
                <p className="mt-1 text-sm text-slate-400">{track.artist}</p>
              </div>
              <p className="text-sm text-slate-400">{formatDuration(track.duration)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => playTrack(track)}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                <Play className="h-4 w-4" />
                Play
              </button>
              <button
                onClick={() => addToQueue(track)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500"
              >
                <Plus className="h-4 w-4" />
                Add to Playlist
              </button>
              <button
                onClick={() => handleOfflineDownload(track)}
                disabled={cachedTracks[track.id]}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {cachedTracks[track.id] ? 'Cached' : 'Download Offline'}
              </button>
            </div>
          </div>
        ))}
        {!pending && tracks.length === 0 && (
          <p className="rounded-3xl border border-dashed border-white/15 bg-slate-900/80 p-6 text-sm text-slate-400">
            No tracks match your search. Try another keyword or check the offline cache.
          </p>
        )}
      </div>
    </section>
  );
}
