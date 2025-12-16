# Bizyaab Server

Express API for Railway that now exposes:

- `GET /api/ping` – sanity check endpoint
- `POST /api/hello` – echoes `Hello <name>` using JSON input `{ "name": "Jane" }`
- `GET /api/businesses` – fetches rows from the Supabase `Businesses` table via Postgres

## Getting started

```bash
cd server
npm install
npm run dev
```

- The server listens on `PORT` (defaults to `4000`)
- Optional `CORS_ORIGIN` env var accepts a comma-separated list of allowed origins (`https://your-vercel-app.vercel.app`)
- Use `*` or leave it unset to allow any origin while testing

## Deploying to Railway
1. Push this folder to its own GitHub repository
2. Create a new Railway service from the repo
3. Add environment variables:
   - `PORT=4000` (Railway also injects `PORT`, so you can omit this)
   - `CORS_ORIGIN=https://your-vercel-domain.vercel.app`
   - `DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres`
   - Optional `DB_SSL=prefer` (default) or `DB_SSL=off` if you run Postgres locally without TLS
4. Redeploy and copy the public URL, e.g. `https://bizyaab-api.up.railway.app`

Point the frontend's `BACKEND_API_BASE_URL` at the Railway URL to send all proxy calls (ping, hello, businesses) through Next.js.
