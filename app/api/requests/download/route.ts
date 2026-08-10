import { NextResponse } from 'next/server';

let downloadTasks: Array<{ id: string; url: string; status: 'queued' | 'downloading' | 'completed' | 'failed'; updatedAt: string }> = [];

export async function GET() {
  return NextResponse.json({ tasks: downloadTasks });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { url } = body as { url?: string };
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
  }

  const id = `dl-${Math.random().toString(36).slice(2, 10)}`;
  downloadTasks.unshift({ id, url, status: 'queued', updatedAt: new Date().toISOString() });

  setTimeout(() => {
    const task = downloadTasks.find((item) => item.id === id);
    if (task) {
      task.status = 'downloading';
      task.updatedAt = new Date().toISOString();
    }
  }, 1200);

  setTimeout(() => {
    const task = downloadTasks.find((item) => item.id === id);
    if (task) {
      task.status = Math.random() < 0.9 ? 'completed' : 'failed';
      task.updatedAt = new Date().toISOString();
    }
  }, 4200);

  return NextResponse.json({ id, status: 'queued' });
}
