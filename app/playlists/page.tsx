import PlaylistManager from '../../components/PlaylistManager';

export default function PlaylistsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-soft">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Playlists</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Templates & Custom Collections</h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Clone default playlists, reorder tracks, and build your own homelab listening sessions with drag-and-drop.
          </p>
        </div>
      </section>
      <PlaylistManager />
    </div>
  );
}
