import { useQuery } from '@tanstack/react-query'
import * as api from '../api'
import type { Song } from '../data'
import { getHistoryRecords, normalizeHistoryItem } from '../history'

export default function RecentlyPlayed({ onPlay }: { onPlay: (s: Song) => void }) {
  const { data: history, isLoading } = useQuery({ queryKey: ['history'], queryFn: api.getHistory })
  const items = getHistoryRecords(history).slice(0, 4).map(normalizeHistoryItem)
  if (isLoading) return <div className="recent-empty">Loading recent activity...</div>
  return (
    <div className="recent-root">
      <h3>Recently played</h3>
      {items.length ? <div className="recent-list">
        {items.map((item) => (
          <button key={item.key} className="recent-row" onClick={() => onPlay(item.song)}>
            <div className="recent-info"><strong>{item.song.title}</strong><small>{item.action} · {item.context}</small></div>
          </button>
        ))}
      </div> : <p className="recent-empty">Your recent tracks will appear here.</p>}
    </div>
  )
}
