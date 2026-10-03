import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, Music2, Plus, X } from 'lucide-react'
import type { Playlist } from '../data'
import * as api from '../api'

interface PlaylistLibraryPageProps {
  userPlaylists: Playlist[]
  defaultPlaylists: Playlist[]
  initialCreateOpen?: boolean
  onCreateDialogOpened?: () => void
  onOpen: (playlist: Playlist) => void
  onCreated: () => void
}

export function PlaylistLibraryPage({ userPlaylists, defaultPlaylists, initialCreateOpen = false, onCreateDialogOpened, onOpen, onCreated }: PlaylistLibraryPageProps) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(initialCreateOpen)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialCreateOpen) onCreateDialogOpened?.()
  }, [initialCreateOpen, onCreateDialogOpened])

  useEffect(() => {
    if (!createOpen) return
    nameInputRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !creating) setCreateOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [createOpen, creating])

  const createPlaylist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const playlistName = name.trim()
    if (!playlistName || creating) return

    setCreating(true)
    setError(null)
    try {
      await api.createPlaylist(playlistName)
      setName('')
      setCreateOpen(false)
      onCreated()
      window.dispatchEvent(new CustomEvent('resona-toast', {
        detail: { message: `Created "${playlistName}"`, type: 'success' },
      }))
    } catch (requestError) {
      setError(api.getApiErrorMessage(requestError))
    } finally {
      setCreating(false)
    }
  }

  const renderCollection = (title: string, items: Playlist[], emptyMessage: string) => (
    <section className="playlist-library-section">
      <div className="section-heading"><h3>{title}</h3><span>{items.length}</span></div>
      {items.length ? (
        <div className="playlist-library-grid">
          {items.map((playlist) => (
            <button className="playlist-library-item" key={`${playlist.playlistType}-${playlist.id}`} onClick={() => onOpen(playlist)}>
              <span className="playlist-library-art">
                {playlist.cover ? <img src={playlist.cover} alt="" /> : <Music2 size={24} />}
              </span>
              <span className="playlist-library-copy">
                <strong>{playlist.name}</strong>
                <small>{playlist.songs?.length ?? 0} songs · {playlist.playlistType === 'default' ? 'Default' : 'Yours'}</small>
              </span>
              <ArrowUpRight size={16} className="playlist-library-arrow" />
            </button>
          ))}
        </div>
      ) : <p className="playlist-library-empty">{emptyMessage}</p>}
    </section>
  )

  return (
    <div className="view fade-in playlist-library-page">
      <div className="page-heading library-heading">
        <div><span className="eyebrow muted">COLLECTIONS</span><h2>Your <em>playlists</em></h2><p>Create a playlist, then add tracks from the library or YouTube.</p></div>
        <button className="primary-button playlist-create-trigger" type="button" onClick={() => { setError(null); setCreateOpen(true) }}>
          <Plus size={16} /> Create playlist
        </button>
      </div>

      {createOpen && (
        <div className="playlist-modal-backdrop" onClick={() => !creating && setCreateOpen(false)}>
          <section className="playlist-create-modal" role="dialog" aria-modal="true" aria-labelledby="create-playlist-title" onClick={(event) => event.stopPropagation()}>
            <header className="playlist-create-modal-header">
              <div><span className="eyebrow muted">NEW COLLECTION</span><h3 id="create-playlist-title">Create a playlist</h3></div>
              <button className="playlist-modal-close" type="button" aria-label="Close dialog" disabled={creating} onClick={() => setCreateOpen(false)}><X size={19} /></button>
            </header>
            <form onSubmit={(event) => void createPlaylist(event)}>
              <label htmlFor="new-playlist-name">Playlist name</label>
              <input
                ref={nameInputRef}
                id="new-playlist-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Late night listening"
                maxLength={100}
                required
              />
              {error && <p className="playlist-create-error" role="alert">{error}</p>}
              <div className="playlist-create-modal-actions">
                <button className="playlist-cancel-button" type="button" disabled={creating} onClick={() => setCreateOpen(false)}>Cancel</button>
                <button className="primary-button" type="submit" disabled={!name.trim() || creating}>
                  <Plus size={16} /> {creating ? 'Creating...' : 'Create playlist'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {renderCollection('YOUR PLAYLISTS', userPlaylists, 'Your playlists will appear here.')}
      {renderCollection('DEFAULT PLAYLISTS', defaultPlaylists, 'No default playlists are available.')}
    </div>
  )
}