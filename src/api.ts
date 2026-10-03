import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')
const API_PREFIX = API_BASE.endsWith('/api/v1') ? '' : '/api/v1'

const client = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  headers: { Accept: 'application/json' },
  withCredentials: true,
})

type RetryConfig = import('axios').InternalAxiosRequestConfig & { _retry?: boolean }
type PendingRequest = { resolve: () => void; reject: (error: unknown) => void }

let refreshing = false
let pendingRequests: PendingRequest[] = []

function settlePendingRequests(error?: unknown) {
  pendingRequests.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()))
  pendingRequests = []
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryConfig | undefined
    const url = config?.url ?? ''

    // Do not attempt token refresh for auth endpoints or requests that already retried
    const isAuthEndpoint = /\/auth\/(google|refresh|logout)/i.test(url)

    if (error.response?.status !== 401 || !config || isAuthEndpoint || config._retry) {
      return Promise.reject(error)
    }

    config._retry = true

    if (refreshing) {
      return new Promise<void>((resolve, reject) => {
        pendingRequests.push({ resolve, reject })
      }).then(() => client.request(config))
    }

    refreshing = true
    try {
      await client.post('/auth/refresh')
      settlePendingRequests()
      return await client.request(config)
    } catch (refreshError) {
      settlePendingRequests(refreshError)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('resona-session-expired'))
      }
      return Promise.reject(refreshError)
    } finally {
      refreshing = false
    }
  },
)

function handleAxiosResponse(res: any) {
  return res.data
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail ?? error.message
  }
  return error instanceof Error ? error.message : 'Request failed'
}

export async function getDefaultPlaylist() {
  const res = await client.get('/playlists/default/')
  return handleAxiosResponse(res)
}

export async function getPlaylists() {
  const res = await client.get('/playlists/')
  return handleAxiosResponse(res)
}

export async function createPlaylist(name: string) {
  const res = await client.post('/playlists/', { name })
  return handleAxiosResponse(res)
}

export async function getPlaylistById(id: string | number) {
  const res = await client.get(`/playlists/${id}/`)
  return handleAxiosResponse(res)
}

export async function getSongs() {
  const res = await client.get('/songs/')
  return handleAxiosResponse(res)
}

export async function getHistory() {
  const res = await client.get('/history')
  return handleAxiosResponse(res)
}

export async function searchSongs(q: string) {
  const res = await client.get('/songs/search', { params: { q } })
  return handleAxiosResponse(res)
}

export async function postGoogleAuth(id_token: string) {
  const res = await client.post('/auth/google', { id_token })
  return handleAxiosResponse(res)
}

export async function getCurrentUser() {
  const res = await client.get('/users/me')
  return handleAxiosResponse(res)
}

export async function postLogout() {
  const res = await client.post('/auth/logout')
  return handleAxiosResponse(res)
}

export async function getSongStream(songId: string | number) {
  const res = await fetch(`${API_BASE}${API_PREFIX}/songs/${songId}/stream`, { credentials: 'include' })
  if (!res.ok) throw new Error(`stream error ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

export async function addSongToPlaylist(
  playlistId: string | number,
  song: { song_id: string | number } | { youtube_url: string },
) {
  const payload = 'song_id' in song ? { song_id: Number(song.song_id) } : song
  const res = await client.post(`/playlists/${playlistId}/songs`, payload)
  return handleAxiosResponse(res)
}

export default {
  getDefaultPlaylist,
  getPlaylists,
  createPlaylist,
  getPlaylistById,
  getSongs,
  getSongStream,
  getHistory,
  getCurrentUser,
  postGoogleAuth,
  postLogout,
  searchSongs,
  addSongToPlaylist,
}