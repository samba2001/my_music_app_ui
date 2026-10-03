import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link2, LoaderCircle, Plus, Search } from 'lucide-react'
import * as api from '../api'

interface SearchSong {
  id: string | number
  name?: string
  title?: string
  author?: string
  artist?: string
}

interface AddSongPageProps {
  playlistId: string | number
  existingSongIds: string[]
  onAdded: () => void
}

function getSearchSongs(data: unknown): SearchSong[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const response = data as { items?: SearchSong[]; results?: SearchSong[]; songs?: SearchSong[] }
    return response.items ?? response.results ?? response.songs ?? []
  }
  return []
}

export default function AddSongPage({ playlistId, existingSongIds, onAdded }: AddSongPageProps) {
  const [mode, setMode] = useState<'search' | 'youtube'>('search')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [addingSongId, setAddingSongId] = useState<string | null>(null)
  const [addingYoutube, setAddingYoutube] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250)
    return () => window.clearTimeout(timeout)
  }, [search])

  const { data, isFetching, isError } = useQuery({
    queryKey: ['playlist-song-search', debouncedSearch],
    queryFn: () => api.searchSongs(debouncedSearch),
    enabled: mode === 'search' && debouncedSearch.length >= 2,
  })
  const searchResults = getSearchSongs(data)

  const showAddError = (requestError: unknown) => {
    const message = api.getApiErrorMessage(requestError)
    setError(/already|409|conflict/i.test(message) ? 'This song is already in the playlist.' : message)
  }

  const addExistingSong = async (song: SearchSong) => {
    setAddingSongId(String(song.id))
    setError(null)
    try {
      await api.addSongToPlaylist(playlistId, { song_id: song.id })
      window.dispatchEvent(new CustomEvent('resona-toast', {
        detail: { message: `Added "${song.name ?? song.title ?? 'Song'}" to playlist`, type: 'success' },
      }))
      onAdded()
    } catch (requestError) {
      showAddError(requestError)
    } finally {
      setAddingSongId(null)
    }
  }

  const addYoutubeSong = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAddingYoutube(true)
    setError(null)
    try {
      await api.addSongToPlaylist(playlistId, { youtube_url: youtubeUrl.trim() })
      setYoutubeUrl('')
      window.dispatchEvent(new CustomEvent('resona-toast', {
        detail: { message: 'Song imported and added to playlist', type: 'success' },
      }))
      onAdded()
    } catch (requestError) {
      showAddError(requestError)
    } finally {
      setAddingYoutube(false)
    }
  }

  return (
    <section className="add-song-panel" aria-label="Add songs to playlist">
      <div className="add-song-panel-heading">
        <div>
          <span className="eyebrow muted">PLAYLIST TOOLS</span>
          <h3>Add songs</h3>
        </div>
        <div className="add-song-modes" role="tablist" aria-label="Add song method">
          <button type="button" role="tab" aria-selected={mode === 'search'} className={mode === 'search' ? 'active' : ''} onClick={() => { setMode('search'); setError(null) }}>
            <Search size={15} /> Search library
          </button>
          <button type="button" role="tab" aria-selected={mode === 'youtube'} className={mode === 'youtube' ? 'active' : ''} onClick={() => { setMode('youtube'); setError(null) }}>
            <Link2 size={15} /> YouTube URL
          </button>
        </div>
      </div>

      {mode === 'search' ? (
        <>
          <label className="sr-only" htmlFor="playlist-song-search">Search songs</label>
          <input
            id="playlist-song-search"
            className="add-song-input"
            placeholder="Search by song title or artist"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {debouncedSearch.length < 2 ? (
            <p className="add-song-hint">Search the shared song library to map an existing track.</p>
          ) : isFetching ? (
            <p className="add-song-hint"><LoaderCircle size={15} className="spin" /> Searching songs...</p>
          ) : isError ? (
            <p className="add-song-hint error">Could not search songs. Try again.</p>
          ) : searchResults.length === 0 ? (
            <p className="add-song-hint">No matching songs found.</p>
          ) : (
            <div className="add-song-results">
              {searchResults.map((song) => {
                const id = String(song.id)
                const alreadyAdded = existingSongIds.includes(id)
                const title = song.name ?? song.title ?? 'Untitled song'
                return (
                  <div className="add-song-result" key={id}>
                    <span><strong>{title}</strong><small>{song.author ?? song.artist ?? `Song ${id}`}</small></span>
                    <button type="button" disabled={alreadyAdded || addingSongId !== null} onClick={() => void addExistingSong(song)}>
                      {alreadyAdded ? 'In playlist' : addingSongId === id ? 'Adding...' : <><Plus size={15} /> Add</>}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <form className="youtube-add-form" onSubmit={(event) => void addYoutubeSong(event)}>
          <label className="sr-only" htmlFor="playlist-youtube-url">YouTube URL</label>
          <input
            id="playlist-youtube-url"
            className="add-song-input"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
          />
          <button className="primary-button" type="submit" disabled={addingYoutube || !youtubeUrl.trim()}>
            {addingYoutube ? 'Importing...' : 'Import and add'}
          </button>
          <p className="add-song-hint">The server imports the audio and adds it to this playlist.</p>
        </form>
      )}
      {error && <p className="add-song-error" role="alert">{error}</p>}
    </section>
  )
}