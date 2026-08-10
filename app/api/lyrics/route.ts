import { NextResponse } from 'next/server';

const lyricsMap: Record<string, Array<{ time: number; text: string }>> = {
  'track-1': [
    { time: 0.5, text: 'Booting up the homelab dream.' },
    { time: 12.2, text: 'Circuit boards and midnight beams.' },
    { time: 24.8, text: 'Synced tracks in quiet rooms.' },
    { time: 38.5, text: 'Offline beats beneath the moon.' }
  ],
  'track-2': [
    { time: 0.6, text: 'Sunrise filters through the racks.' },
    { time: 16.0, text: 'Warm light touches cables, stacks.' },
    { time: 31.3, text: 'Ambient servers hum the tune.' }
  ],
  'track-3': [
    { time: 0.5, text: 'Cache the beat, keep it close.' },
    { time: 18.4, text: 'Offline playback when the signal froze.' },
    { time: 32.0, text: 'Queued for later, saved and ready.' }
  ],
  'track-4': [
    { time: 0.4, text: 'Latency falls away tonight.' },
    { time: 14.6, text: 'Synths align in neon light.' },
    { time: 29.7, text: 'Stream the heartbeat, stay in sync.' }
  ]
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const trackId = url.searchParams.get('trackId') ?? 'track-1';
  const lyrics = lyricsMap[trackId] ?? [
    { time: 0.5, text: 'Silent labs, waiting for the song.' },
    { time: 13.4, text: 'Play the track and carry on.' }
  ];
  return NextResponse.json({ lyrics });
}
