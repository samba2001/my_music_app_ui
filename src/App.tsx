import { useRef, useState, useEffect } from 'react'
import { Clock3, FastForward, House, ListMusic, LogOut, Menu, Music2, Pause, Play, Plus, Rewind, SkipBack, SkipForward, X } from 'lucide-react'
import type { Playlist, Song } from './data'
import * as api from './api'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary'
import { Toast } from './components/Toast'
import UserProfile from './components/UserProfile'
import { useAuth } from './authContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PlaylistPage } from './pages/PlaylistPage'
import { PlaylistLibraryPage } from './pages/PlaylistLibraryPage'
import NoAccessPage from './pages/NoAccessPage'
import LandingPage from './pages/LandingPage'
import { SongPage } from './pages/SongPage'
import SearchBox from './components/SearchBox'
import RecentlyPlayed from './components/RecentlyPlayed'
import { isAdmin } from './auth'
import { getHistoryRecords, normalizeHistoryItem } from './history'

function normalizePlaylist(raw: any, fallbackType: 'default' | 'user'): Playlist {
  const rawType = raw.playlist_type ?? raw.playlistType
  return {
    id: String(raw.id),
    name: raw.name ?? 'Untitled playlist',
    playlistType: rawType === 'default' || rawType === 'user' ? rawType : fallbackType,
    description: raw.description ?? '',
    cover: raw.cover ?? raw.playlist_cover ?? undefined,
    songs: (raw.songs ?? []).map((item: any) => {
      const song = item.song ?? item
      return {
        id: String(song.id),
        title: song.name ?? song.title ?? 'Unknown',
        artist: song.author ?? song.artist ?? '',
        duration: song.duration == null ? undefined : String(song.duration),
        cover: song.cover ?? undefined,
      }
    }),
  }
}

function normalizePlaylistList(data: any, type: 'default' | 'user'): Playlist[] {
  const items = Array.isArray(data) ? data : data?.items ?? data?.results ?? data?.playlists ?? []
  return items.map((playlist: any) => normalizePlaylist(playlist, type))
}

function App() {
  const [view, setView] = useState<'home'|'playlist'|'library'|'history'|'landing'|'song'|'noaccess'>('landing')
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | number | null>(null)
  const [selectedPlaylistType, setSelectedPlaylistType] = useState<'default' | 'user'>('user')
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createPlaylistOnOpen, setCreatePlaylistOnOpen] = useState(false)
  const auth = useAuth()

  const qc = useQueryClient()
  const { data: userPlaylistData = [], isLoading: userPlaylistsLoading } = useQuery({ queryKey: ['user-playlists'], queryFn: api.getPlaylists, enabled: auth.isAuthenticated })
  const { data: defaultPlaylistData = [], isLoading: defaultPlaylistsLoading } = useQuery({ queryKey: ['default-playlists'], queryFn: api.getDefaultPlaylist, enabled: auth.isAuthenticated })
  const userPlaylists = normalizePlaylistList(userPlaylistData, 'user')
  const defaultPlaylists = normalizePlaylistList(defaultPlaylistData, 'default')
  const allPlaylists = [...userPlaylists, ...defaultPlaylists]
  const playlistsLoading = userPlaylistsLoading || defaultPlaylistsLoading
  const playlistQuery = useQuery({
    queryKey: ['playlist', selectedPlaylistType, selectedPlaylistId],
    queryFn: () => (selectedPlaylistId ? api.getPlaylistById(selectedPlaylistId) : null),
    enabled: auth.isAuthenticated && !!selectedPlaylistId,
  })

  useEffect(() => {
    if (playlistQuery.data) {
      const raw = playlistQuery.data.playlist ?? playlistQuery.data
      setCurrentPlaylist(normalizePlaylist(raw, selectedPlaylistType))
    }
  }, [playlistQuery.data, selectedPlaylistType])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setCurrentTime(a.currentTime || 0)
    const onDuration = () => setDuration(a.duration || 0)
    const onEnded = async () => {
      // autoplay next track if available
      if (!currentPlaylist || !currentSong) { setIsPlaying(false); return }
      const items = (currentPlaylist.songs || []).map((it: any) => it.song ?? it)
      const idx = items.findIndex((s: any) => String(s.id) === String(currentSong.id))
      if (idx >= 0 && idx < items.length - 1) {
        const s = items[idx + 1]
        const songObj: Song = { id: String(s.id), title: s.name ?? s.title ?? 'Unknown', artist: s.author ?? s.artist ?? '' }
        await playSong(songObj)
      } else {
        setIsPlaying(false)
      }
    }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onDuration)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onDuration)
      a.removeEventListener('ended', onEnded)
    }
  }, [audioRef.current, audioSrc])

  // keyboard shortcuts are added later after playSong is defined to avoid reference errors

  const openPlaylist = (playlist: Playlist) => {
    setSelectedPlaylistId(playlist.id)
    setSelectedPlaylistType(playlist.playlistType ?? 'user')
    setCurrentPlaylist(playlist)
    setView('playlist')
  }

  const playSong = async (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    try { const src = await api.getSongStream(song.id); setAudioSrc(src) } catch (e) { console.error(e) }
  }

  const prevTrack = async () => {
    if (!currentPlaylist || !currentSong) return
    const items = (currentPlaylist.songs || []).map((it: any) => it.song ?? it)
    const idx = items.findIndex((s: any) => String(s.id) === String(currentSong.id))
    if (idx > 0) {
      const s = items[idx - 1]
      const songObj: Song = { id: String(s.id), title: s.name ?? s.title ?? 'Unknown', artist: s.author ?? s.artist ?? '' }
      await playSong(songObj)
    }
  }

  const nextTrack = async () => {
    if (!currentPlaylist || !currentSong) return
    const items = (currentPlaylist.songs || []).map((it: any) => it.song ?? it)
    const idx = items.findIndex((s: any) => String(s.id) === String(currentSong.id))
    if (idx >= 0 && idx < items.length - 1) {
      const s = items[idx + 1]
      const songObj: Song = { id: String(s.id), title: s.name ?? s.title ?? 'Unknown', artist: s.author ?? s.artist ?? '' }
      await playSong(songObj)
    }
  }

  // Set audio source only when it changes (fixes restart-on-pause bug)
  useEffect(() => {
    if (!audioRef.current || !audioSrc) return
    audioRef.current.src = audioSrc
  }, [audioSrc])

  // Control play/pause independently from source change
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      void audioRef.current.play().catch(() => setIsPlaying(false))
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // keyboard shortcuts: left/right arrows seek 10s, space toggles play, n/p next/prev
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); return }
      if (e.key === 'ArrowLeft') { if (audioRef.current) audioRef.current.currentTime = Math.max(0, (audioRef.current.currentTime || 0) - 10); return }
      if (e.key === 'ArrowRight') { if (audioRef.current) audioRef.current.currentTime = (audioRef.current.currentTime || 0) + 10; return }
      if (e.key.toLowerCase() === 'n') { void (async () => { if (currentPlaylist && currentSong) { const items = (currentPlaylist.songs || []).map((it: any) => it.song ?? it); const idx = items.findIndex((s: any) => String(s.id) === String(currentSong.id)); if (idx >= 0 && idx < items.length - 1) { const s = items[idx + 1]; const songObj: Song = { id: String(s.id), title: s.name ?? s.title ?? 'Unknown', artist: s.author ?? s.artist ?? '' }; await playSong(songObj) } } })(); return }
      if (e.key.toLowerCase() === 'p') { void (async () => { if (currentPlaylist && currentSong) { const items = (currentPlaylist.songs || []).map((it: any) => it.song ?? it); const idx = items.findIndex((s: any) => String(s.id) === String(currentSong.id)); if (idx > 0) { const s = items[idx - 1]; const songObj: Song = { id: String(s.id), title: s.name ?? s.title ?? 'Unknown', artist: s.author ?? s.artist ?? '' }; await playSong(songObj) } } })(); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [audioRef.current, currentPlaylist, currentSong])

  const loadHistory = async () => { const h = await api.getHistory().catch(() => []); setHistory(getHistoryRecords(h)); setView('history') }

  // Listen for requests to show the NoAccess page when a non-admin attempts admin actions
  useEffect(() => {
    const handler = () => setView('noaccess')
    window.addEventListener('resona-show-noaccess', handler as EventListener)
    return () => window.removeEventListener('resona-show-noaccess', handler as EventListener)
  }, [])

  useEffect(() => {
    const onSignedOut = () => setView('landing')
    const onSignedIn = () => setView('home')
    window.addEventListener('resona-signed-out', onSignedOut as EventListener)
    window.addEventListener('resona-signed-in', onSignedIn as EventListener)
    const onShowLogin = () => setView('landing')
    window.addEventListener('resona-show-login', onShowLogin as EventListener)
    // set initial view based on auth state
    if (!auth.isLoading) setView(auth.isAuthenticated ? 'home' : 'landing')
    return () => {
      window.removeEventListener('resona-signed-out', onSignedOut as EventListener)
      window.removeEventListener('resona-signed-in', onSignedIn as EventListener)
      window.removeEventListener('resona-show-login', onShowLogin as EventListener)
    }
  }, [auth.isAuthenticated, auth.isLoading])

  if (auth.isLoading) return null

  // If user is not authenticated, show only the Landing SSO UI
  if (!auth.isAuthenticated) {
    return (
      <div className="landing-only">
        <Toast />
        <LandingPage />
      </div>
    )
  }

  return (
    <div className="app-shell">
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <Toast />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      <header className="mobile-topbar">
        <button className="mobile-menu-button" type="button" aria-label="Open navigation" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
        <div className="mobile-brand">♫ <span>Charan</span></div>
        <button className="mobile-profile-button" type="button" aria-label="Open profile" onClick={() => setShowProfile(true)}>
          {(auth.user?.name || auth.user?.sub || 'U').toString().charAt(0).toUpperCase()}
        </button>
      </header>
      {sidebarOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand-row">
          <div className="brand" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.5px' }}>♫ Charan</div>
          <button className="icon-btn desktop-profile-button" onClick={() => setShowProfile(true)} title="Profile" style={{ padding: '8px 12px' }}>
            <div className="mini-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{(auth.user?.name || auth.user?.sub || 'U').toString().charAt(0).toUpperCase()}</div>
          </button>
          <button className="sidebar-close-button" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={19} /></button>
        </div>
        <div className="nav" style={{ marginTop: 24 }}>
          <button className={view === 'home' ? 'active' : ''} onClick={() => { setView('home'); setSidebarOpen(false) }}><House size={17} /> Home</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => { setSidebarOpen(false); void loadHistory() }}><Clock3 size={17} /> History</button>
          <button className={view === 'library' ? 'active' : ''} onClick={() => { setView('library'); setSidebarOpen(false) }}><ListMusic size={17} /> Playlists</button>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <button onClick={async () => {
            setSidebarOpen(false)
            window.dispatchEvent(new CustomEvent('resona-toast', { detail: { message: 'Logged out', type: 'info' } }))
            await auth.logout()
          }} style={{ color: 'var(--error-color)' }}><LogOut size={17} /> Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <div className="main-search"><SearchBox onSelect={(s) => { setCurrentSong(s); setView('song'); setSidebarOpen(false) }} /></div>
        <ErrorBoundary>
        {view === 'landing' && <section><LandingPage /></section>}
        {view === 'home' && <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="home-welcome">
            <div>
              <h2 style={{ marginBottom: 12 }}>Welcome, {auth.user?.name || 'Music Lover'}</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Your music, your mood, your way.</p>
            </div>
            <button className="home-create-playlist" type="button" onClick={() => { setCreatePlaylistOnOpen(true); setView('library') }}><Plus size={15} /> Create playlist</button>
          </div>
          <div>
            <RecentlyPlayed onPlay={(s) => { setCurrentSong(s); playSong(s); setView('song') }} />
          </div>
          <div>
            <div className="home-playlists-heading">
              <h3>Your playlists</h3>
            </div>
            <div className="home-playlist-grid">
              {playlistsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="playlist-skeleton" aria-hidden />)
              ) : (
                allPlaylists.map((playlist) => (
                  <button className="home-playlist-card" type="button" key={`${playlist.playlistType}-${playlist.id}`} onClick={() => openPlaylist(playlist)}>
                    <strong>{playlist.name}</strong>
                    <small>{(playlist.songs || []).length} songs · {playlist.playlistType === 'default' ? 'Default' : 'Yours'}</small>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>}
        {view === 'library' && <PlaylistLibraryPage
          userPlaylists={userPlaylists}
          defaultPlaylists={defaultPlaylists}
          initialCreateOpen={createPlaylistOnOpen}
          onCreateDialogOpened={() => setCreatePlaylistOnOpen(false)}
          onOpen={openPlaylist}
          onCreated={() => { void qc.invalidateQueries({ queryKey: ['user-playlists'] }) }}
        />}
        {view === 'song' && currentSong && <section><SongPage song={currentSong} playing={isPlaying} onBack={() => setView('home')} onToggle={() => { if (isPlaying) setIsPlaying(false); else void playSong(currentSong) }} /></section>}
        {view === 'playlist' && (
          playlistQuery.isLoading ? (
            <section><h2>Loading playlist...</h2><div>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="song-skeleton" aria-hidden />)}</div></section>
          ) : currentPlaylist ? (
            <PlaylistPage
              playlist={currentPlaylist}
              canAddSongs={currentPlaylist.playlistType === 'default'
                ? isAdmin(auth.user)
                : userPlaylists.some((playlist) => playlist.id === currentPlaylist.id)}
              onBack={() => setView('home')}
              onPlay={playSong}
              onSongAdded={() => {
                void qc.invalidateQueries({ queryKey: ['playlist', selectedPlaylistType, selectedPlaylistId] })
                void qc.invalidateQueries({ queryKey: ['user-playlists'] })
                void qc.invalidateQueries({ queryKey: ['default-playlists'] })
              }}
            />
          ) : null
        )}
        {view === 'history' && <section className="history-page">
          <header className="history-heading"><span className="eyebrow muted">YOUR LISTENING</span><h2>History</h2><p>Tracks you played and added to playlists.</p></header>
          {history.length ? <div className="history-list">{history.map((record, index) => {
            const item = normalizeHistoryItem(record, index)
            return <button className="history-row" key={item.key} onClick={() => playSong(item.song)}>
              <span className="history-track-icon"><Music2 size={17} /></span>
              <span className="history-track-copy"><strong>{item.song.title}</strong><small>{item.action} · {item.context}</small></span>
              {item.occurredAt && <time>{item.occurredAt}</time>}
            </button>
          })}</div> : <div className="history-empty"><Music2 size={22} /><strong>No activity yet</strong><span>Tracks you play or add will appear here.</span></div>}
        </section>}
        {view === 'noaccess' && <section><NoAccessPage /></section>}
        </ErrorBoundary>
      </main>
      <div className="player-bar">
        <div className="player-controls">
          <button className="big-btn" aria-label="Previous track" onClick={prevTrack}><SkipBack size={18} /></button>
          <button className="small-btn" aria-label="Rewind 10 seconds" onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, (audioRef.current.currentTime || 0) - 10) }}><Rewind /></button>
          <button className="play-btn" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={() => setIsPlaying(p => !p)}>{isPlaying ? <Pause /> : <Play />}</button>
          <button className="small-btn" aria-label="Forward 10 seconds" onClick={() => { if (audioRef.current) audioRef.current.currentTime = (audioRef.current.currentTime || 0) + 10 }}><FastForward /></button>
          <button className="big-btn" aria-label="Next track" onClick={nextTrack}><SkipForward size={18} /></button>
        </div>
        <div className="player-track">
          <div className="now">{currentSong ? `${currentSong.title} — ${currentSong.artist}` : 'No song'}</div>
          <input className="seek-slider" type="range" min={0} max={duration || 0} step={0.01} value={Math.min(currentTime, duration || 0)} onChange={(e) => { const v = Number(e.target.value); if (audioRef.current) audioRef.current.currentTime = v; setCurrentTime(v) }} />
          <div className="time-row" style={{ justifyContent: 'space-between' }}><small>{new Date((currentTime || 0) * 1000).toISOString().substr(14, 5)}</small><small>{isFinite(duration) && duration > 0 ? new Date(duration * 1000).toISOString().substr(14, 5) : '--:--'}</small></div>
        </div>
      </div>
    </div>
  )
}

export default App
