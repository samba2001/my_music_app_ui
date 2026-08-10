import { NextResponse } from 'next/server';

const sampleTracks = [
  {
    id: 'track-1',
    title: 'Homelab Groove',
    artist: 'Local Beats',
    duration: 214,
    lyricsKeywords: 'lab groove music',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'track-2',
    title: 'Server Room Sunrise',
    artist: 'Ambient Nodes',
    duration: 193,
    lyricsKeywords: 'sunrise server room',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'track-3',
    title: 'Cache Cycle',
    artist: 'Bit Patterns',
    duration: 176,
    lyricsKeywords: 'cache cycle offline replay',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'track-4',
    title: 'Low Latency Love',
    artist: 'Synth Nodes',
    duration: 241,
    lyricsKeywords: 'latency love queue',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  }
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('q')?.toLowerCase() ?? '';

  const filtered = sampleTracks.filter((track) => {
    if (!search) return true;
    const term = search.trim();
    return [track.title, track.artist, track.lyricsKeywords].some((value) => value.toLowerCase().includes(term));
  });

  return NextResponse.json({ tracks: filtered });
}
