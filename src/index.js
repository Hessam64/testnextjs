const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : [];
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || 'Businesses';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or key missing. /api/businesses will return a 500 until configured.');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Allow REST tools or same-origin requests
      return callback(null, true);
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Bizyaab Railway-ready API',
    hint: 'Use /api/ping, /api/hello, or /api/businesses to test integrations.'
  });
});

app.get('/api/ping', (req, res) => {
  res.json({
    message: 'Pong from Railway! Just to make sure CORS is working correctly.',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || null
  });
});

app.post('/api/hello', (req, res) => {
  const { name } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const trimmed = name.trim();

  return res.json({
    message: `Hello ${trimmed}!`,
    timestamp: new Date().toISOString()
  });
});

const buildSupabaseUrl = () => {
  if (!SUPABASE_URL) {
    return null;
  }

  const endpoint = new URL(`/rest/v1/${encodeURIComponent(SUPABASE_TABLE)}`, SUPABASE_URL);
  endpoint.searchParams.set('select', 'id,name,created_at');
  endpoint.searchParams.set('order', 'created_at.desc');
  endpoint.searchParams.set('limit', '100');
  return endpoint;
};

const supabaseEndpoint = buildSupabaseUrl();

app.get('/api/businesses', async (req, res) => {
  if (!supabaseEndpoint || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Supabase connection is not configured' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const response = await fetch(supabaseEndpoint, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: authHeader,
        Accept: 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Supabase error:', data);
      return res.status(response.status).json({ error: 'Failed to fetch businesses from Supabase' });
    }

    return res.json({ businesses: data });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
  if (allowedOrigins.length) {
    console.log(`Restricting CORS to: ${allowedOrigins.join(', ')}`);
  } else {
    console.log('CORS is open to any origin. Set CORS_ORIGIN to lock it down.');
  }
});
