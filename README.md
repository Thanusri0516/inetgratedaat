# AAT

Temperature dashboard (React + Vite): live reading, trend chart, forecast, and an assistant. Landing page at `/`, dashboard at `/dashboard`.

## Run

```bash
npm install
npm run dev:server
npm run dev
```

## API (optional)

Add `.env`:

```env
VITE_API_BASE_URL=https://your-server.com
VITE_USE_MOCK_API=false
```

For local development, the repo now includes a small backend on `http://localhost:3001`.

If you want to force the old demo mode instead, add:

```env
VITE_USE_MOCK_API=true
```

API paths live in `src/config/apiEndpoints.ts`. See that file (and `src/api/types.ts`) for request/response shapes.

## Build

```bash
npm run build
npm run preview
```
