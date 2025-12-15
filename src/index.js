const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : [];

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
