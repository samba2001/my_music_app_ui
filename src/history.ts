import type { Song } from './data'

export interface HistoryDisplayItem {
  key: string
  song: Song
  action: string
  context: string
  occurredAt: string | null
}

const ACTION_LABELS: Record<string, string> = {
  SONG_PLAYED: 'Played',
  ADD_SONG: 'Added to playlist',
  SONG_ADDED: 'Added to playlist',
}

export function normalizeHistoryItem(value: any, index: number): HistoryDisplayItem {
  const record = value?.history ?? value ?? {}
  const nestedSong = record.song ?? record.track
  const rawSong = nestedSong ?? record
  const songId = nestedSong?.id ?? record.song_id ?? record.id ?? `entry-${index + 1}`
  const song: Song = {
    id: String(songId),
    title: rawSong.name ?? rawSong.title ?? rawSong.song_name ?? record.song_name ?? (record.song_id ? `Song ${record.song_id}` : 'Unknown song'),
    artist: rawSong.author ?? rawSong.artist ?? record.artist ?? '',
    duration: rawSong.duration == null ? undefined : String(rawSong.duration),
    cover: rawSong.cover ?? rawSong.thumbnail ?? undefined,
  }

  const actionType = String(record.action_type ?? record.action ?? 'SONG_PLAYED').toUpperCase()
  const action = ACTION_LABELS[actionType] ?? actionType.toLowerCase().replace(/_/g, ' ').replace(/^./, (letter: string) => letter.toUpperCase())
  const playlistName = record.playlist?.name ?? record.playlist_name
  const playlistId = record.playlist_id ?? record.playlist?.id
  const context = playlistName ?? (playlistId ? `Playlist ${playlistId}` : song.artist || `Track ${songId}`)

  const timestamp = record.created_at ?? record.timestamp ?? record.event_time ?? record.date
  const parsedDate = timestamp ? new Date(timestamp) : null
  const occurredAt = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(parsedDate)
    : null

  return {
    key: String(record.id ?? `${songId}-${actionType}-${index}`),
    song,
    action,
    context,
    occurredAt,
  }
}

export function getHistoryRecords(data: any): any[] {
  if (Array.isArray(data)) return data
  return data?.items ?? data?.results ?? data?.history ?? []
}