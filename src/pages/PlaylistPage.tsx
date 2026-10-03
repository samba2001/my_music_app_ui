import { ArrowLeft, MoreHorizontal, Play, Shuffle } from 'lucide-react'
import type { Playlist, Song } from '../data'
import { SongArtwork } from '../components/SongArtwork'
import AddSongPage from './AddSongPage'

export interface PlaylistPageProps {
  playlist: Playlist
  canAddSongs: boolean
  onBack: () => void
  onPlay: (song: Song) => void
  onSongAdded: () => void
}

export function PlaylistPage({ playlist, canAddSongs, onBack, onPlay, onSongAdded }: PlaylistPageProps) {
  const playlistSongs = playlist.songs ?? []
  const playlistSongIds = new Set(playlistSongs.map((song) => String(song.id)))

  return <div className="view fade-in">
    <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to library</button>
    <div className="playlist-hero"><img src={playlist.cover} alt={`${playlist.name} cover`} /><div><span className="eyebrow muted">{playlist.playlistType === 'default' ? 'DEFAULT PLAYLIST' : 'YOUR PLAYLIST'}</span><h2>{playlist.name}</h2><p>{playlist.description}</p><span className="playlist-meta">{playlistSongs.length} songs</span></div></div>
    <div className="playlist-actions"><button className="play-button" disabled={!playlistSongs.length} onClick={() => playlistSongs[0] && onPlay(playlistSongs[0])}><Play size={17} fill="currentColor" /> Play all</button><button className="circle-action" aria-label="Shuffle playlist"><Shuffle size={17} /></button><button className="circle-action" aria-label="More playlist actions"><MoreHorizontal size={18} /></button></div>
    {canAddSongs && <AddSongPage playlistId={playlist.id} existingSongIds={[...playlistSongIds]} onAdded={onSongAdded} />}
    <div className="results-list playlist-songs">{playlistSongs.map((song, index) => <button className="song-row" key={`${playlist.id}-${index}`} onClick={() => onPlay(song)}><span className="song-index">{index + 1}</span><SongArtwork song={song} /><span className="song-row-info"><strong>{song.title}</strong><small>{song.artist}</small></span><span className="song-duration">{song.duration}</span></button>)}</div>
  </div>
}
