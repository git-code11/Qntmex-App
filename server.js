const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from both .env and .env.local files
dotenv.config();
if (fs.existsSync('.env.local')) {
  const localEnv = dotenv.parse(fs.readFileSync('.env.local'));
  for (const key in localEnv) {
    process.env[key] = localEnv[key];
  }
}

const app = express();
const PORT = 3000;

// Collect all environment variables for Firebase
const collectEnvVars = () => {
  // Priority: .env.local > .env > hardcoded values
  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAXRaee-MKecRMD54lr8labcVT-Urp5e_g",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "qntm-43b47.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "qntm-43b47",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "qntm-43b47.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "822203561811",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:822203561811:web:da7949e62b1b3d4423d3a6"
  };
};

// Get Firebase config
const firebaseConfig = collectEnvVars();

// Log the Firebase configuration
console.log("Server starting with Firebase config:", {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 5)}...` : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING',
  envVars: Object.keys(process.env)
    .filter(key => key.includes('FIREBASE') || key.includes('REACT_APP'))
    .map(key => key)
});

// Middleware to modify HTML files and inject Firebase config
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/' || !req.path.includes('.')) {
    const filePath = req.path === '/' || !req.path.includes('.')
      ? path.join(__dirname, 'build', 'index.html')
      : path.join(__dirname, 'build', req.path);

    if (fs.existsSync(filePath)) {
      let fileContent = fs.readFileSync(filePath, 'utf8');

      // Inject Firebase config into the HTML file
      const injectScript = `
        <script>
          window.__FIREBASE_CONFIG__ = ${JSON.stringify(firebaseConfig)};
          window.REACT_APP_FIREBASE_API_KEY = "${firebaseConfig.apiKey}";
          window.REACT_APP_FIREBASE_AUTH_DOMAIN = "${firebaseConfig.authDomain}";
          window.REACT_APP_FIREBASE_PROJECT_ID = "${firebaseConfig.projectId}";
          window.REACT_APP_FIREBASE_STORAGE_BUCKET = "${firebaseConfig.storageBucket}";
          window.REACT_APP_FIREBASE_MESSAGING_SENDER_ID = "${firebaseConfig.messagingSenderId}";
          window.REACT_APP_FIREBASE_APP_ID = "${firebaseConfig.appId}";
          console.log("Firebase config injected in HTML:", {
            configSet: true,
            apiKeyLength: window.__FIREBASE_CONFIG__.apiKey ? window.__FIREBASE_CONFIG__.apiKey.length : 0
          });
        </script>
      `;

      // Only inject if not already present
      if (!fileContent.includes('__FIREBASE_CONFIG__')) {
        // Insert after the opening head tag
        const headIndex = fileContent.indexOf('<head>') + 6;
        if (headIndex > 6) {
          fileContent = fileContent.slice(0, headIndex) + injectScript + fileContent.slice(headIndex);
        } else {
          // Fallback - add at the top of the document
          fileContent = injectScript + fileContent;
        }
      }

      res.set('Content-Type', 'text/html');
      return res.send(fileContent);
    }
  }
  next();
});

// Enable CORS
app.use(cors());

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    firebase: {
      configPresent: !!firebaseConfig.apiKey,
      apiKeyValid: !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10,
      authDomainPresent: !!firebaseConfig.authDomain
    }
  });
});

// Handle API routes for testing
app.get('/api/debug/env', (req, res) => {
  // Return sanitized environment info for debugging
  const safeEnvVars = {};
  Object.keys(process.env)
    .filter(key => key.includes('REACT_APP') || key.includes('NODE_'))
    .forEach(key => {
      const value = process.env[key];
      safeEnvVars[key] = value ? `${value.substring(0, 3)}...` : 'undefined';
    });

  res.json({
    env: safeEnvVars,
    firebase: {
      configValid: !!firebaseConfig.apiKey && !!firebaseConfig.authDomain,
      apiKeyPresent: !!firebaseConfig.apiKey,
      authDomainPresent: !!firebaseConfig.authDomain
    }
  });
});

// Debug endpoint to check if build exists
app.get('/api/debug/build', (req, res) => {
  try {
    const buildPath = path.join(__dirname, 'build');
    const indexPath = path.join(buildPath, 'index.html');
    
    const buildExists = fs.existsSync(buildPath);
    const indexExists = fs.existsSync(indexPath);
    
    res.json({
      buildDirectoryExists: buildExists,
      indexHtmlExists: indexExists,
      buildContents: buildExists ? fs.readdirSync(buildPath) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make sure we're serving static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Please make sure the application is built properly.');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Firebase config status: API Key ${firebaseConfig.apiKey ? 'present' : 'missing'}, Auth Domain ${firebaseConfig.authDomain ? 'present' : 'missing'}`);
  console.log(`Server URL: http://0.0.0.0:${PORT}`);
});

// Start the CORS proxy if needed
if (process.env.START_PROXY === 'true') {
  try {
    require('./src/corsProxy');
    console.log('CORS proxy started successfully');
  } catch (error) {
    console.error('Failed to start CORS proxy:', error.message);
    // Continue running the main server even if proxy fails
  }
}