const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : [];
const sslPreference = (process.env.DB_SSL || '').toLowerCase();
const forceIpv4 = ['1', 'true', 'yes'].includes((process.env.DB_FORCE_IPV4 || '').toLowerCase());

const buildDbConfig = () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    const config = {
      host: dbUrl.hostname,
      port: Number(dbUrl.port) || 5432,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, ''),
      ssl:
        sslPreference === 'false' || sslPreference === 'off'
          ? false
          : {
              rejectUnauthorized: sslPreference === 'strict'
            }
    };

    if (forceIpv4) {
      config.family = 4;
    }

    return config;
  } catch (error) {
    console.error('Failed to parse DATABASE_URL. Check your connection string.', error);
    return null;
  }
};

const dbConfig = buildDbConfig();
const dbPool = dbConfig ? new Pool(dbConfig) : null;

if (!dbPool) {
  console.warn('DATABASE_URL is not set or invalid. /api/businesses will return a 500 until configured.');
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
    hint: 'Hit /api/ping from your Next.js frontend to test CORS.'
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

app.get('/api/businesses', async (req, res) => {
  if (!dbPool) {
    return res.status(500).json({ error: 'Database connection is not configured' });
  }

  try {
    const { rows } = await dbPool.query(
      'SELECT id, name, created_at FROM "Businesses" ORDER BY created_at DESC LIMIT 100;'
    );
    return res.json({ businesses: rows });
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
