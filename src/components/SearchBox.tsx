import React, { useEffect, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as api from '../api'
import type { Song } from '../data'

export default function SearchBox({ onSelect }: { onSelect: (s: Song) => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const { data, isLoading } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => api.searchSongs(debounced),
    enabled: !!debounced
  })

  const results: any[] = data || []
  const [focused, setFocused] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setOpen(!!debounced)
  }, [debounced])

  useEffect(() => {
    if (!open) setFocused(-1)
    else setFocused(results.length ? 0 : -1)
  }, [open, results.length])

  const handleSelect = (s: any) => {
    const song: Song = { id: String(s.id), title: s.name ?? s.title ?? 'Unknown', artist: s.author ?? s.artist ?? '', duration: s.duration ?? undefined, album: s.album ?? '' }
    onSelect(song)
    setOpen(false)
    setQ('')
    setDebounced('')
  }

  const highlight = (text: string, q: string) => {
    if (!q) return text
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'))
    return parts.map((p, i) => p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused((f) => Math.min(results.length - 1, f + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocused((f) => Math.max(0, f - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (focused >= 0 && results[focused]) handleSelect(results[focused]) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); setFocused(-1) }
  }

  return (
    <div className="search-root">
      <div className="search-input">
        <input ref={inputRef} placeholder="Search songs, artists..." value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(!!q)} onKeyDown={onKeyDown} />
      </div>
      {open && (
        <div className="search-overlay" role="dialog">
          <div className="search-panel">
            {isLoading ? <div className="search-loading">Searching…</div> : (
              results.length ? (
                <div className="search-results" role="listbox">
                  {results.map((r: any, i: number) => (
                    <button key={i} className={`search-row ${i === focused ? 'focused' : ''}`} onClick={() => handleSelect(r)} onMouseEnter={() => setFocused(i)}>
                      { (r.cover || r.thumbnail) && <img src={r.cover || r.thumbnail} alt="art" style={{ width:48, height:48, borderRadius:6, objectFit:'cover', marginRight:10 }} /> }
                      <div className="search-row-info"><strong>{highlight(r.name ?? r.title ?? '', debounced)}</strong><small>{highlight(r.author ?? r.artist ?? '', debounced)}</small></div>
                    </button>
                  ))}
                </div>
              ) : <div className="search-empty">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
