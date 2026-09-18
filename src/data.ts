export interface Song { id: string; title: string; artist: string; album: string; duration: string; cover: string; accent: string }
export interface Playlist { id: string; name: string; description: string; cover: string; songIds: string[]; accent: string }
export interface User { name: string; email: string; avatar: string }

const images = {
  sunset: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85',
  ocean: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85',
  city: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=85',
  forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85',
  portrait: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=85',
}

export const songs: Song[] = [
  { id: 'sunset-lover', title: 'Sunset Lover', artist: 'Petit Biscuit', album: 'Presence', duration: '3:58', cover: images.sunset, accent: '#f08767' },
  { id: 'midnight', title: 'Midnight', artist: 'Coldplay', album: 'Moon Music', duration: '4:21', cover: images.city, accent: '#7885ee' },
  { id: 'better-together', title: 'Better Together', artist: 'Jack Johnson', album: 'In Between Dreams', duration: '3:26', cover: images.ocean, accent: '#58c1c2' },
  { id: 'apocalypse', title: 'Apocalypse', artist: 'Cigarettes After Sex', album: 'Cigarettes After Sex', duration: '4:50', cover: images.mountain, accent: '#bb89d9' },
  { id: 'space-song', title: 'Space Song', artist: 'Beach House', album: 'Depression Cherry', duration: '5:20', cover: images.sunset, accent: '#8e67ed' },
  { id: 'let-her-go', title: 'Let Her Go', artist: 'Passenger', album: 'All the Little Lights', duration: '4:12', cover: images.forest, accent: '#83c5a5' },
  { id: 'riptide', title: 'Riptide', artist: 'Vance Joy', album: 'Dream Your Life Away', duration: '3:24', cover: images.ocean, accent: '#5bafd6' },
  { id: 'someone-loved', title: 'Someone You Loved', artist: 'Lewis Capaldi', album: 'Divinely Uninspired', duration: '3:02', cover: images.city, accent: '#e67b96' },
]

export const playlists: Playlist[] = [
  { id: 'chill-vibes', name: 'Chill Vibes', description: 'Perfect for relaxing, studying or just chilling out.', cover: images.sunset, songIds: ['sunset-lover', 'midnight', 'better-together', 'apocalypse', 'space-song'], accent: '#f08767' },
  { id: 'focus', name: 'Focus', description: 'Quiet sounds for deep work and clear thinking.', cover: images.mountain, songIds: ['space-song', 'midnight', 'let-her-go', 'apocalypse'], accent: '#7b8fec' },
  { id: 'workout', name: 'Workout', description: 'Your energy, turned all the way up.', cover: images.city, songIds: ['riptide', 'someone-loved', 'midnight', 'better-together'], accent: '#c264e6' },
  { id: 'favorites', name: 'Favorites', description: 'Your most-loved tracks, all in one place.', cover: images.ocean, songIds: ['sunset-lover', 'better-together', 'riptide', 'someone-loved'], accent: '#5ac4bd' },
]

export const currentUser: User = { name: 'Samba Siva', email: 'samba@resona.app', avatar: images.portrait }
export function getSong(id: string) { return songs.find((song) => song.id === id) ?? songs[0] }
export function getPlaylist(id: string) { return playlists.find((playlist) => playlist.id === id) ?? playlists[0] }