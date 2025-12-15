# Bizyaab Server

Simple Express API designed to be deployed on Railway. The `/api/ping` route returns JSON so you can test connectivity, and `/api/hello` accepts a JSON body `{ "name": "Jane" }` and responds with a personalized greeting.

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
4. Redeploy and copy the public URL, e.g. `https://bizyaab-api.up.railway.app`

Point the frontend's `BACKEND_API_BASE_URL` at the Railway URL to send both the ping and hello proxy calls through Next.js.
