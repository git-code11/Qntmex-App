
/**
 * Environment Variables Configuration and Validation
 */

// Check if required environment variables are set
export const checkRequiredEnvVars = () => {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_ALCHEMY_API_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

// Get API configuration with defaults
export const getApiConfig = () => {
  return {
    alchemy: {
      apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
      network: 'mainnet'
    },
    firebase: {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    },
    opensea: {
      apiKey: process.env.REACT_APP_OPENSEA_API_KEY
    },
    coingecko: {
      apiKey: process.env.REACT_APP_COINGECKO_API_KEY
    },
    coincap: {
      apiKey: process.env.REACT_APP_COINCAP_API_KEY
    },
    trongrid: {
      apiKey: process.env.REACT_APP_TRONGRID_API_KEY
    },
    solana: {
      rpcUrl: process.env.REACT_APP_SOLANA_RPC_URL
    }
  };
};
