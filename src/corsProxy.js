
const axios = require('axios');
const express = require('express');

// Try to load cors, but don't crash if missing
let cors;
try {
  cors = require('cors');
} catch (error) {
  console.warn('CORS module not found, proxy will run with basic CORS headers');
}

// Create an Express app for the proxy
const app = express();

// Only use cors middleware if available
if (cors) {
  app.use(cors());
} else {
  // Simple CORS headers if module not available
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

// Proxy for CoinGecko requests
app.get('/api/coingecko/:path(*)', async (req, res) => {
  try {
    const path = req.params.path;
    const response = await axios.get(`https://api.coingecko.com/api/v3/${path}`, {
      headers: {
        'Accept': 'application/json',
        'x-cg-pro-api-key': process.env.REACT_APP_COINGECKO_API_KEY || 'CG-gD4Cdq35pAmBAvjznnKhvs2z'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the proxy server on a different port
const PORT = process.env.PROXY_PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CORS proxy running on port ${PORT}`);
});

module.exports = { proxyUrl: `http://localhost:${PORT}/api` };
