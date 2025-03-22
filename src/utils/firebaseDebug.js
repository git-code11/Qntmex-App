
/**
 * Firebase Debugging Utilities
 */
import { firebaseConfig, debugFirebaseConfig } from '../config';
import { auth } from '../firebase';

/**
 * Test Firebase authentication by trying to initialize a test app
 */
export const testFirebaseAuth = async () => {
  try {
    const firebase = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    
    console.log('Testing Firebase auth with config keys:', Object.keys(firebaseConfig));
    
    // Initialize a test app
    const testApp = firebase.initializeApp(firebaseConfig, 'test-app');
    const testAuth = getAuth(testApp);
    
    console.log('Test Firebase app initialized successfully:', {
      appName: testApp.name,
      authAvailable: !!testAuth
    });
    
    // Clean up test app
    testApp.delete().then(() => {
      console.log('Test Firebase app deleted successfully');
    });
    
    return true;
  } catch (error) {
    console.error('Firebase auth test failed:', error);
    return false;
  }
};

/**
 * Test Firebase auth connection by initializing a temporary test app
 * This is a separate function from testFirebaseAuth above
 */
export const testFirebaseAuthConnection = async () => {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    
    // Try to initialize a test app with current config
    console.log('Testing Firebase auth with config:', debugFirebaseConfig());
    
    // Create unique name for test app
    const testAppName = `test-app-${Date.now()}`;
    const testApp = initializeApp(firebaseConfig, testAppName);
    const testAuth = getAuth(testApp);
    
    console.log('Test Firebase auth successful:', {
      testAppName,
      testAuthAvailable: !!testAuth
    });
    
    // Clean up test app
    await testApp.delete();
    console.log('Test app deleted');
    
    return true;
  } catch (error) {
    console.error('Firebase auth test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Log Firebase status
 */
export const logFirebaseStatus = () => {
  try {
    // Check process.env
    const envVars = {};
    if (typeof process !== 'undefined' && process.env) {
      Object.keys(process.env).forEach(key => {
        if (key.includes('FIREBASE') || key.includes('REACT_APP_FIREBASE')) {
          envVars[key] = process.env[key] ? `${process.env[key].substring(0, 3)}...` : undefined;
        }
      });
    }
    
    // Check window variables
    const windowVars = {};
    if (typeof window !== 'undefined') {
      // Check if Firebase config is in window
      if (window.__FIREBASE_CONFIG__) {
        windowVars['__FIREBASE_CONFIG__'] = {
          apiKeyPresent: !!window.__FIREBASE_CONFIG__.apiKey,
          authDomainPresent: !!window.__FIREBASE_CONFIG__.authDomain
        };
      }
      
      // Check individual window variables
      ['REACT_APP_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_AUTH_DOMAIN'].forEach(key => {
        windowVars[key] = window[key] ? `${window[key].substring(0, 3)}...` : undefined;
      });
    }
    
    console.log('Firebase Environment Status:', {
      env: envVars,
      window: windowVars
    });
    
    // Try to import the firebase config directly
    import('../config').then(config => {
      console.log('Firebase Config from import:', {
        apiKeyPresent: !!config.firebaseConfig.apiKey,
        authDomainPresent: !!config.firebaseConfig.authDomain,
        projectIdPresent: !!config.firebaseConfig.projectId
      });
    }).catch(err => {
      console.error('Failed to import config.js:', err.message);
    });
    
  } catch (error) {
    console.error('Error in logFirebaseStatus:', error);
  }
};

/**
 * Log detailed Firebase status including environment variables and config
 */
export const logDetailedFirebaseStatus = () => {
  // Log window injected config if available
  if (typeof window !== 'undefined') {
    console.log('Window Firebase config available:', !!window.__FIREBASE_CONFIG__);
    if (window.__FIREBASE_CONFIG__) {
      console.log('Window config keys:', Object.keys(window.__FIREBASE_CONFIG__).join(', '));
      console.log('Window apiKey valid:', !!window.__FIREBASE_CONFIG__.apiKey);
    }
  }

  // Log current config being used
  console.log('Current Firebase config:', debugFirebaseConfig());

  // Log auth status
  console.log('Firebase auth initialized:', !!auth);
  
  return {
    configValid: !!firebaseConfig.apiKey && !!firebaseConfig.authDomain,
    authInitialized: !!auth,
    configSource: debugFirebaseConfig().source
  };
};

/**
 * Add this to Login component to debug Firebase issues
 */
export const debugLoginProcess = async (email) => {
  const status = logDetailedFirebaseStatus();
  console.log(`Preparing to log in ${email} with Firebase status:`, status);
  
  // Test auth initialization if needed
  if (!status.authInitialized) {
    console.log('Auth not initialized, testing Firebase...');
    const testResult = await testFirebaseAuth();
    console.log('Firebase test result:', testResult);
  }
  
  return status;
};
