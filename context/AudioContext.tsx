'use client';

import type { ReactNode, RefObject } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
}

interface AudioContextValue {
  queue: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  lyrics: Array<{ time: number; text: string }>;
  addToQueue: (track: Track) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setLyrics: (lines: Array<{ time: number; text: string }>) => void;
  audioRef: RefObject<HTMLAudioElement>;
  showLyrics: boolean;
  toggleLyrics: () => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<Array<{ time: number; text: string }>>([]);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => playNext();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack]);

  const syncAudioSrc = (track: Track | null) => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.audioUrl;
    audio.load();
  };

  useEffect(() => {
    syncAudioSrc(currentTrack);
  }, [currentTrack]);

  const addToQueue = (track: Track) => {
    setQueue((current) => {
      const exists = current.some((item) => item.id === track.id);
      if (exists) return current;
      return [...current, track];
    });
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const playNext = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((item) => item.id === currentTrack.id);
    const next = queue[currentIndex + 1] ?? queue[0];
    setCurrentTrack(next);
    setCurrentTime(0);
    audioRef.current?.play();
  };

  const playPrevious = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((item) => item.id === currentTrack.id);
    const previous = queue[currentIndex - 1] ?? queue[queue.length - 1];
    setCurrentTrack(previous);
    setCurrentTime(0);
    audioRef.current?.play();
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      return;
    }
    audio.pause();
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  };

  const toggleLyrics = () => setShowLyrics((current) => !current);

  const value = useMemo(
    () => ({
      queue,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      lyrics,
      addToQueue,
      playTrack,
      togglePlay,
      playNext,
      playPrevious,
      seek,
      setVolume,
      setLyrics,
      audioRef,
      showLyrics,
      toggleLyrics
    }),
    [queue, currentTrack, isPlaying, currentTime, duration, lyrics, showLyrics]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
