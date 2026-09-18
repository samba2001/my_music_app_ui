import { ArrowLeft, MoreHorizontal, Play, Shuffle } from 'lucide-react'
import { getSong, type Playlist, type Song } from '../data'
import { SongArtwork } from '../components/SongArtwork'

export interface PlaylistPageProps {
  playlist: Playlist
  onBack: () => void
  onPlay: (song: Song) => void
}

export function PlaylistPage({ playlist, onBack, onPlay }: PlaylistPageProps) {
  const playlistSongs = playlist.songIds.map(getSong)
  return <div className="view fade-in">
    <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to library</button>
    <div className="playlist-hero"><img src={playlist.cover} alt={`${playlist.name} cover`} /><div><span className="eyebrow muted">PLAYLIST</span><h2>{playlist.name}</h2><p>{playlist.description}</p><span className="playlist-meta">Static Resona playlist • {playlistSongs.length} songs • one audio source</span></div></div>
    <div className="playlist-actions"><button className="play-button" onClick={() => onPlay(playlistSongs[0])}><Play size={17} fill="currentColor" /> Play all</button><button className="circle-action"><Shuffle size={17} /></button><button className="circle-action"><MoreHorizontal size={18} /></button></div>
    <div className="results-list playlist-songs">{playlistSongs.map((song, index) => <button className="song-row" key={`${playlist.id}-${index}`} onClick={() => onPlay(song)}><span className="song-index">{index + 1}</span><SongArtwork song={song} /><span className="song-row-info"><strong>{song.title}</strong><small>{song.artist} · bundled MP3</small></span><span className="song-duration">{song.duration}</span></button>)}</div>
  </div>
}
