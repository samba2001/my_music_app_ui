import { Sparkles } from 'lucide-react'

export function BrandMark({ large = false }: { large?: boolean }) {
  return <span className={`brand-mark${large ? ' large' : ''}`}><Sparkles size={large ? 24 : 17} /></span>
}
