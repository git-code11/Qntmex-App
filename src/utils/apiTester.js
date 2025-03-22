import { 
  ALCHEMY_API_KEY, 
  ETHERSCAN_API_KEY, 
  COINGECKO_API_KEY,
  firebaseConfig
} from '../config';

const testAPIs = async () => {
  console.log('API Tester running...');

  // Test configuration availability
  console.log('API Key Status:');
  console.log('- Alchemy API Key:', ALCHEMY_API_KEY ? 'Available ✓' : 'Missing ✗');
  console.log('- Etherscan API Key:', ETHERSCAN_API_KEY ? 'Available ✓' : 'Missing ✗');
  console.log('- CoinGecko API Key:', COINGECKO_API_KEY ? 'Available ✓' : 'Missing ✗');
  console.log('- Firebase Config:', firebaseConfig ? 'Available ✓' : 'Missing ✗');

  // Test Firebase connection
  if (window.__FIREBASE_CONFIG__) {
    let configStatus = {
      directConfigSet: !!window.__FIREBASE_CONFIG__,
      apiKeySet: !!window.REACT_APP_FIREBASE_API_KEY,
      processEnvSet: !!process.env.REACT_APP_FIREBASE_API_KEY
    };
    console.log('Firebase config initialized in window:', configStatus);
  }
};

// Run immediately but don't block
setTimeout(testAPIs, 2000);

export default testAPIs;