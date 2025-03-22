import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add keyframe animations for smooth transitions
const style = document.createElement('style');
style.innerHTML = 
  "  @keyframes spin {" +
  "    0% { transform: rotate(0deg); }" +
  "    100% { transform: rotate(360deg); }" +
  "  }" +
  "  @keyframes fadeIn {" +
  "    from { opacity: 0; }" +
  "    to { opacity: 1; }" +
  "  }";
document.head.appendChild(style);
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { logFirebaseStatus, testFirebaseAuth } from './utils/firebaseDebug';

// Run Firebase diagnostics
if (process.env.NODE_ENV === 'development') {
  logFirebaseStatus();
  testFirebaseAuth().then(success => {
    console.log('Firebase auth test result:', success ? 'SUCCESS' : 'FAILED');
  });
}
import { AuthProvider } from './AuthContext';
import { ethers } from 'ethers';
import './firebase'; // Import firebase to ensure initialization

// Add keyframe animations for smooth transitions
document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
`);

// Custom theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    blue: {
      500: '#3396FF',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
});

// Import but don't call directly - it self-executes
import './utils/apiTester';

// Import debug utility
import { logConfigStatus } from './utils/debug';

// Log environment variables and configuration status
import { logAvailableConfigs } from './config';

// Log config status
logAvailableConfigs();

// Debug environment variables
console.log("Environment Variables in index.js:", {
  REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  NODE_ENV: process.env.NODE_ENV
});

const root = ReactDOM.createRoot(document.getElementById('root'));
import ErrorBoundary from './components/ErrorBoundary';

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ChakraProvider theme={theme}>
            <App />
          </ChakraProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);