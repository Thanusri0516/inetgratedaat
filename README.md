# AAT

Temperature dashboard (React + Vite): live reading, trend chart, forecast, and an assistant. Landing page at `/`, dashboard at `/dashboard`.

## Run

```bash
npm install
npm run dev
```

## API (optional)

Add `.env`:

```env
VITE_API_BASE_URL=https://your-server.com
```

Leave it unset to use built-in demo data.

API paths live in `src/config/apiEndpoints.ts`. See that file (and `src/api/types.ts`) for request/response shapes.

## Build

```bash
npm run build
npm run preview
```
