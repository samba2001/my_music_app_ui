import { ArrowLeft, Heart, Pause, Play } from 'lucide-react'
import type { Song } from '../data'
import { AudioSourceNotice } from '../components/AudioSourceNotice'
import { SongArtwork } from '../components/SongArtwork'

export interface SongPageProps {
  song: Song
  playing: boolean
  onBack: () => void
  onToggle: () => void
}

export function SongPage({ song, playing, onBack, onToggle }: SongPageProps) {
  return <div className="view fade-in song-page"><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to player</button><div className="song-page-layout"><SongArtwork song={song} className="song-page-art" /><div className="song-page-details"><span className="eyebrow muted">STATIC SONG PAGE</span><h2>{song.title}</h2><p>{song.artist}</p><div className="song-page-actions"><button className="play-button" onClick={onToggle}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />} {playing ? 'Pause' : 'Play song'}</button><button className="circle-action" aria-label="Like song"><Heart size={17} /></button></div><div className="song-page-meta"><span>Album</span><strong>{song.album}</strong><span>Duration</span><strong>{song.duration}</strong><span>Playback</span></div></div></div></div>
}
