export interface Song { id: string; title: string; artist: string; album?: string; duration?: string; cover?: string; accent?: string }
export interface Playlist { id: string; name: string; description?: string; cover?: string; songIds?: string[]; songs?: Song[]; accent?: string; playlistType?: 'default' | 'user' }
export interface User { name: string; email: string; avatar: string }

export const defaultUser: User = { name: 'Samba Siva', email: 'samba@resona.app', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=85' }