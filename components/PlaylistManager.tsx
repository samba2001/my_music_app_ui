'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Music, Shuffle } from 'lucide-react';

interface TrackEntry {
  id: string;
  title: string;
  artist: string;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  tracks: TrackEntry[];
  isTemplate: boolean;
}

const templates: Playlist[] = [
  {
    id: 'template-1',
    title: 'Night Server Chill',
    description: 'Evening playlist for long sessions near the rack.',
    isTemplate: true,
    tracks: [
      { id: 'track-1', title: 'Homelab Groove', artist: 'Local Beats' },
      { id: 'track-3', title: 'Cache Cycle', artist: 'Bit Patterns' }
    ]
  },
  {
    id: 'template-2',
    title: 'Morning Sync',
    description: 'Refresh with a focused playlist for boot and sync.',
    isTemplate: true,
    tracks: [
      { id: 'track-2', title: 'Server Room Sunrise', artist: 'Ambient Nodes' },
      { id: 'track-4', title: 'Low Latency Love', artist: 'Synth Nodes' }
    ]
  }
];

const initialPlaylists: Playlist[] = [
  {
    id: 'playlist-1',
    title: 'My Mix',
    description: 'Custom collection for coding sessions.',
    isTemplate: false,
    tracks: [
      { id: 'track-1', title: 'Homelab Groove', artist: 'Local Beats' },
      { id: 'track-2', title: 'Server Room Sunrise', artist: 'Ambient Nodes' }
    ]
  }
];

export default function PlaylistManager() {
  const [myPlaylists, setMyPlaylists] = useState(initialPlaylists);

  const clonePlaylist = (template: Playlist) => {
    const copied: Playlist = {
      ...template,
      id: `${template.id}-clone-${Date.now()}`,
      title: `${template.title} (Copy)`,
      isTemplate: false
    };
    setMyPlaylists((current) => [copied, ...current]);
  };

  const reorderTrack = (playlistId: string, trackId: string, direction: 'up' | 'down') => {
    setMyPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        const index = playlist.tracks.findIndex((item) => item.id === trackId);
        if (index === -1) return playlist;
        const nextIndex = direction === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= playlist.tracks.length) return playlist;
        const nextTracks = [...playlist.tracks];
        [nextTracks[index], nextTracks[nextIndex]] = [nextTracks[nextIndex], nextTracks[index]];
        return { ...playlist, tracks: nextTracks };
      })
    );
  };

  const playlistCount = useMemo(() => myPlaylists.length, [myPlaylists]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Manage</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Your Playlists</h2>
        </div>
        <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
          {playlistCount} custom playlists
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Default templates</h3>
              <p className="text-sm text-slate-400">Clone a template into your own editable playlist.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              <Shuffle className="h-4 w-4" /> Templates
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((template) => (
              <article key={template.id} className="rounded-3xl border border-white/10 bg-slate-900/90 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{template.title}</p>
                    <p className="mt-2 text-sm text-slate-400">{template.description}</p>
                  </div>
                  <button
                    onClick={() => clonePlaylist(template)}
                    className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500"
                  >
                    <Copy className="mr-2 h-4 w-4" /> Clone Playlist
                  </button>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  {template.tracks.map((track) => (
                    <div key={track.id} className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-3 py-2">
                      <span>{track.title}</span>
                      <span className="text-slate-400">{track.artist}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">My playlists</h3>
              <p className="text-sm text-slate-400">Reorder tracks with arrows or add template copies below.</p>
            </div>
          </div>
          <div className="space-y-4">
            {myPlaylists.map((playlist) => (
              <article key={playlist.id} className="rounded-3xl border border-white/10 bg-slate-900/90 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{playlist.title}</p>
                    <p className="text-sm text-slate-400">{playlist.description}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
                    <Music className="h-4 w-4" /> {playlist.tracks.length} tracks
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {playlist.tracks.map((track, index) => (
                    <div key={track.id} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-950/80 px-4 py-3">
                      <div>
                        <p className="font-semibold text-white">{track.title}</p>
                        <p className="text-sm text-slate-400">{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => reorderTrack(playlist.id, track.id, 'up')}
                          disabled={index === 0}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => reorderTrack(playlist.id, track.id, 'down')}
                          disabled={index === playlist.tracks.length - 1}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
