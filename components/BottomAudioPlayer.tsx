'use client';

import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2, Music2, AlignJustify } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import LyricsOverlay from './LyricsOverlay';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

function formatTime(time: number) {
  if (!Number.isFinite(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function BottomAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    audioRef,
    showLyrics,
    toggleLyrics
  } = useAudio();
  const [volume, setVolumeState] = useState(0.75);
  const { isOffline } = useNetworkStatus();
  const progressPercentage = useMemo(() => (duration > 0 ? (currentTime / duration) * 100 : 0), [currentTime, duration]);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setVolumeState(value);
    setVolume(value);
  };

  return (
    <>
      <audio ref={audioRef} className="hidden" preload="metadata" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 px-4 py-3 shadow-soft backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {currentTrack?.title ?? 'Select a track to start playback'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {currentTrack?.artist ?? 'Homelab Audio'} • {isOffline ? 'Offline available' : 'Live streaming'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLyrics}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
              >
                <AlignJustify className="h-4 w-4" /> Lyrics
              </button>
              <button
                onClick={togglePlay}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-soft transition hover:bg-sky-400"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={(event) => seek(Number(event.target.value))}
                className="w-full accent-sky-400"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={playPrevious}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/90 text-slate-200 transition hover:border-slate-500"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={playNext}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/90 text-slate-200 transition hover:border-slate-500"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3">
              <Volume2 className="h-4 w-4 text-slate-300" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-sky-400"
              />
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <Music2 className="h-4 w-4" />
                Queue controls are active while a track is selected.
              </span>
            </div>
          </div>
        </div>
      </div>
      {showLyrics && <LyricsOverlay />}
    </>
  );
}
