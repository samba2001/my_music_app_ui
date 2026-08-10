# Homelab Music Player (UI)

This is a mobile-first PWA built with Next.js (App Router), Tailwind CSS, and Lucide React icons. It includes offline audio caching, a persistent bottom audio player, synced lyrics overlay, and a YouTube audio downloader UI.

## Quick setup

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production:

```bash
npm run build
npm run start
```

## Environment & Auth configuration

You can configure authentication behavior in two ways:

- Environment variable: create a `.env.local` with the following key to enable the auth gate by default:

```env
NEXT_PUBLIC_AUTH_ENABLED=true
```

- Local override: toggle the auth gate in-app (button in the header), which persists the state to `localStorage` under the key `homelab-isAuthEnabled`.

If `NEXT_PUBLIC_AUTH_ENABLED` is not set or is `false`, the app will default to an auth-bypass with a local admin user.

### Symbol guidance

You mentioned `#sym:isAuthEnabled false`. To achieve the same effect, set either:

- In `.env.local`:

```env
# sym:isAuthEnabled false
NEXT_PUBLIC_AUTH_ENABLED=false
```

- Or in the browser console/localStorage:

```js
localStorage.setItem('homelab-isAuthEnabled', 'false')
```

This will keep authentication bypassed and use the local admin user.

## Service worker & PWA

The service worker is registered at `public/sw.js`. Audio responses are cached in `homelab-music-cache-v1`.

## Notes

- To enable Google login, set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your `.env.local`.
- The app exposes a simple API under `/app/api` for demo and local homelab integration.

If you want, I can also add a `vite.config.ts` for a standalone Vite build (e.g., if you want to run the UI separately), but this project is currently configured for Next.js App Router.
