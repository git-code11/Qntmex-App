
// Debug utilities
export const logConfigStatus = () => {
  console.log("Environment Status Check:", {
    windowAvailable: typeof window !== 'undefined',
    processAvailable: typeof process !== 'undefined' && !!process.env,
    firebaseConfig: typeof window !== 'undefined' && (
      !!window.__FIREBASE_CONFIG__ || !!window.REACT_APP_FIREBASE_API_KEY
    ),
    nodeEnv: typeof process !== 'undefined' && process.env.NODE_ENV || 'unknown'
  });
  
  // Check if window has Firebase config
  if (typeof window !== 'undefined') {
    console.log("Window has Firebase config:", 
      !!(window.REACT_APP_FIREBASE_API_KEY && window.REACT_APP_FIREBASE_AUTH_DOMAIN));
  }
  
  // Log which configs are available from config.js
  try {
    const configModule = require('../config');
    const availableConfigs = Object.keys(configModule)
      .filter(key => typeof configModule[key] === 'object')
      .map(key => ({ 
        name: key, 
        hasApiKey: !!configModule[key].apiKey 
      }));
    
    console.log("Available configurations:", availableConfigs);
  } catch (error) {
    console.error("Error checking config.js:", error.message);
  }
};

export const logErrorDetails = (error, context = '') => {
  console.error(`Error in ${context || 'application'}:`, {
    message: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name
  });
};
