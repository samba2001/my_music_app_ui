'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';

export default function LyricsOverlay() {
  const { currentTrack, currentTime, setLyrics, lyrics, toggleLyrics } = useAudio();
  const [loading, setLoading] = useState(false);
  const lyricsListRef = useRef<HTMLDivElement>(null);
  const activeIndex = useMemo(() => {
    return lyrics.reduce((acc, line, index) => (line.time <= currentTime ? index : acc), 0);
  }, [currentTime, lyrics]);

  useEffect(() => {
    if (!currentTrack) return;
    setLoading(true);
    fetch(`/api/lyrics?trackId=${currentTrack.id}`)
      .then((res) => res.json())
      .then((data) => setLyrics(data.lyrics ?? []))
      .finally(() => setLoading(false));
  }, [currentTrack, setLyrics]);

  useEffect(() => {
    const container = lyricsListRef.current;
    if (!container) return;
    const activeLine = container.querySelector(`[data-lyric-index="${activeIndex}"]`);
    if (activeLine) {
      (activeLine as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/95 px-4 py-6 backdrop-blur-2xl sm:px-8">
      <div className="mx-auto flex h-full max-w-4xl flex-col rounded-[2rem] border border-slate-800 bg-slate-950/95 p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Lyrics Overlay</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{currentTrack.title}</h2>
            <p className="text-sm text-slate-400">{currentTrack.artist}</p>
          </div>
          <button
            onClick={toggleLyrics}
            className="rounded-3xl bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900/90 p-5">
          {loading ? (
            <p className="text-slate-400">Loading synced lyrics…</p>
          ) : (
            <div ref={lyricsListRef} className="space-y-4 overflow-auto px-2 py-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {lyrics.length === 0 ? (
                <p className="text-slate-400">No synced lyrics available for this track.</p>
              ) : (
                lyrics.map((line, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={`${line.time}-${index}`}
                      data-lyric-index={index}
                      className={`rounded-3xl px-4 py-3 transition ${isActive ? 'bg-sky-500/20 text-sky-100' : 'bg-slate-950/70 text-slate-300'}`}
                    >
                      <p className="text-sm font-semibold text-slate-200">{line.text}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-500">{line.time.toFixed(2)}s</p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
