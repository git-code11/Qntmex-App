// Environment detection
export const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
export const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

// Firebase configuration - reads from window first, then env variables, then fallback values
const getFirebaseConfig = () => {
  // For deployed environment, check window.__FIREBASE_CONFIG__ first (injected by server.js)
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    console.log("Using Firebase config from window.__FIREBASE_CONFIG__");
    return window.__FIREBASE_CONFIG__;
  }
  
  // Direct window variables (another way configs might be exposed)
  if (typeof window !== 'undefined' && 
      window.REACT_APP_FIREBASE_API_KEY && 
      window.REACT_APP_FIREBASE_AUTH_DOMAIN) {
    console.log("Using Firebase config from window direct variables");
    return {
      apiKey: window.REACT_APP_FIREBASE_API_KEY,
      authDomain: window.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: window.REACT_APP_FIREBASE_PROJECT_ID || "crypto-wallet-c67aa",
      storageBucket: window.REACT_APP_FIREBASE_STORAGE_BUCKET || "crypto-wallet-c67aa.appspot.com",
      messagingSenderId: window.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "863370373958",
      appId: window.REACT_APP_FIREBASE_APP_ID || "1:863370373958:web:9bf5915bb6c1ee471c6a5a"
    };
  }

  // Try to get from environment variables
  try {
    const envConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };

    // Check if env variables are available
    if (envConfig.apiKey && envConfig.authDomain) {
      console.log("Using Firebase config from environment variables");
      return envConfig;
    }
  } catch (error) {
    console.error("Error getting env variables:", error);
  }

  // Try .env.local config (fixed values)
  const localConfig = {
    apiKey: "AIzaSyAA2qk988KzbMrOzgnGVNxZMqXVJHyaOPo",
    authDomain: "crypto-wallet-c67aa.firebaseapp.com",
    projectId: "crypto-wallet-c67aa",
    storageBucket: "crypto-wallet-c67aa.appspot.com",
    messagingSenderId: "863370373958",
    appId: "1:863370373958:web:9bf5915bb6c1ee471c6a5a"
  };
  
  console.log("Using fallback Firebase config (.env.local values)");
  return localConfig;
};

// Export the resolved config
export const firebaseConfig = getFirebaseConfig();

// API Keys
export const ALCHEMY_API_KEY = "hWnKsjkh6BtBYOyOjU_vvtm0tp3reDLX";
export const alchemyApiKey = ALCHEMY_API_KEY;
export const alchemyApiKeyAlias = ALCHEMY_API_KEY;

export const COINGECKO_API_KEY = "CG-gD4Cdq35pAmBAvjznnKhvs2z";
export const coinGeckoApiKeyAlias = COINGECKO_API_KEY;

export const ETHERSCAN_API_KEY = "NSZCD6S4TKVJ2EQKK89MWK152SQHXVQBV1";
export const etherscanApiKeyAlias = ETHERSCAN_API_KEY;

// Function to log available configs
export const logAvailableConfigs = () => {
  console.log("Firebase Config Status:", {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    appId: !!firebaseConfig.appId
  });
};

// API Base URL
export const API_BASE_URL = "https://api.example.com";

// Coin configs
export const coinGeckoConfig = {
  apiUrl: 'https://api.coingecko.com/api/v3',
  proApiUrl: 'https://pro-api.coingecko.com/api/v3'
};

export const coinCapConfig = {
  baseUrl: "https://api.coincap.io/v2"
};

// Feature flags
export const FEATURES = {
  enableMockData: true,
  enableRealTimeUpdates: false,
  useCoinGeckoAPI: true,
  useCoinCapAPI: true
};

// Mock pricing data for testing
export const mockPrices = {
  'BTC': 60000 + Math.random() * 2000,
  'ETH': 3300 + Math.random() * 100,
  'TON': 5.5 + Math.random() * 0.5,
  'TRX': 0.12 + Math.random() * 0.01,
  'SOL': 100 + Math.random() * 5,
  'XRP': 0.5 + Math.random() * 0.1,
  'USDT': 0.99 + Math.random() * 0.02,
  'USDC': 0.99 + Math.random() * 0.02,
};

// OpenSea configuration
export const openSeaConfig = {
  baseUrl: "https://api.opensea.io/api/v1",
  apiKey: ""
};

// Helper function to get API config
export const getApiConfig = (serviceName) => {
  switch(serviceName) {
    case 'coingecko':
      return coinGeckoConfig;
    case 'coincap':
      return coinCapConfig;
    case 'opensea':
      return openSeaConfig;
    default:
      return null;
  }
};

// Ethereum configuration 
export const getEthereumConfig = () => {
  return {
    alchemyKey: ALCHEMY_API_KEY,
    etherscanKey: ETHERSCAN_API_KEY,
    network: 'mainnet'
  };
};

// Alchemy configurations
export const alchemyConfig = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY || "demo-key",
  network: process.env.REACT_APP_ALCHEMY_NETWORK || "eth-sepolia"
};

// Expose a debug method to check Firebase config
export const debugFirebaseConfig = () => {
  const config = getFirebaseConfig();
  return {
    apiKeyExists: !!config.apiKey,
    apiKeyLength: config.apiKey ? config.apiKey.length : 0,
    authDomain: config.authDomain,
    projectId: config.projectId,
    source: typeof window !== 'undefined' && window.__FIREBASE_CONFIG__ 
      ? 'window' 
      : (process.env.REACT_APP_FIREBASE_API_KEY ? 'env' : 'fallback')
  };
};


// Log config status in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Config loaded with Firebase API Key:', !!firebaseConfig.apiKey);
  console.log('Environment:', isDevelopment ? 'Development' : isProduction ? 'Production' : 'Test');
  console.log('API Keys Available:', {
    etherscan: !!ETHERSCAN_API_KEY,
    alchemy: !!ALCHEMY_API_KEY,
    coinGecko: !!COINGECKO_API_KEY
  });
  console.log('Firebase Config Available:', !!firebaseConfig.apiKey);
  logAvailableConfigs();
}

export default {
  firebaseConfig,
  ETHERSCAN_API_KEY,
  ALCHEMY_API_KEY,
  COINGECKO_API_KEY,
  openSeaConfig,
  API_BASE_URL,
  FEATURES,
  getEthereumConfig,
  getApiConfig,
  isDevelopment,
  isProduction,
  etherscanApiKeyAlias,
  alchemyApiKeyAlias,
  coinGeckoApiKeyAlias,
  logAvailableConfigs,
  coinGeckoConfig,
  alchemyApiKey,
  coinCapConfig,
  mockPrices,
  alchemyConfig,
  debugFirebaseConfig
};

function getApiKey(envVar1, envVar2, defaultValue) {
  return process.env[envVar1] || process.env[envVar2] || defaultValue;
}