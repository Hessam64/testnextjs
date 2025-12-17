# Bizyaab Server

Express API for Railway exposing:

- `GET /api/ping` – sanity check endpoint
- `POST /api/hello` – echoes `Hello <name>` using JSON input `{ "name": "Jane" }`
- `GET /api/businesses` – fetches rows from the Supabase `Businesses` table via Supabase's REST API

## Getting started

```bash
cd server
npm install
npm run dev
```

- The server listens on `PORT` (defaults to `4000`)
- Optional `CORS_ORIGIN` env var accepts a comma-separated list of allowed origins (`https://your-vercel-app.vercel.app`)
- Use `*` or leave it unset to allow any origin while testing
- Configure Supabase access via environment variables (see below)

## Deploying to Railway
1. Push this folder to its own GitHub repository
2. Create a new Railway service from the repo
3. Add environment variables:
   - `PORT=4000` (Railway also injects `PORT`, so you can omit this)
   - `CORS_ORIGIN=https://your-vercel-domain.vercel.app`
   - `SUPABASE_URL=https://sbndhjrcgcevngokqhkx.supabase.co`
   - `SUPABASE_ANON_KEY=...` (your Supabase anon/service key – store securely)
   - Optional `SUPABASE_TABLE=Businesses` if you renamed the table
4. Redeploy and copy the public URL, e.g. `https://bizyaab-api.up.railway.app`

Point the frontend's `BACKEND_API_BASE_URL` at the Railway URL to send all proxy calls (ping, hello, businesses) through Next.js.
