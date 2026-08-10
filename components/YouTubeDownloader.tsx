'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CloudUpload, Loader2 } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface DownloadTask {
  id: string;
  url: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  updatedAt: string;
}

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { isOffline } = useNetworkStatus();

  const loadTasks = async () => {
    try {
      const response = await apiClient.get('/requests/download');
      setTasks(response.data.tasks ?? []);
    } catch (error) {
      setTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = window.setInterval(loadTasks, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const submitDownload = async () => {
    if (!url.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post('/requests/download', { url: url.trim() });
      setUrl('');
      await loadTasks();
    } catch (error) {
      alert('Unable to submit the download task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-soft">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Downloader</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">YouTube Audio Queue</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Submit a YouTube audio request to your backend. New requests are disabled while offline.
        </p>
      </div>
      <div className="space-y-4">
        <label className="block text-sm text-slate-300">
          URL
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
            disabled={isOffline}
          />
        </label>
        <button
          onClick={submitDownload}
          disabled={!url.trim() || isOffline || submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
          Submit download task
        </button>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
          <p>Active download tasks</p>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
            {tasks.length} items
          </span>
        </div>
        <div className="space-y-3">
          {tasks.length === 0 && <p className="text-sm text-slate-400">No queued downloads yet.</p>}
          {tasks.map((task) => (
            <div key={task.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{task.url}</p>
                  <p className="text-xs text-slate-400">Updated {new Date(task.updatedAt).toLocaleTimeString()}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${
                    task.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : task.status === 'downloading'
                      ? 'bg-sky-500/15 text-sky-300'
                      : task.status === 'failed'
                      ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-slate-700/15 text-slate-300'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
