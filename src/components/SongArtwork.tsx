import type { Song } from '../data'

export function SongArtwork({ song, className = '' }: { song: Song; className?: string }) {
  return <img className={className} src={song.cover} alt={`${song.title} cover`} />
}
