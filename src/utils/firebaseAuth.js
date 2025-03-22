
import { auth } from '../firebase';
import { firebaseConfig } from '../config';

/**
 * Function to test Firebase authentication status
 * @returns {Object} Status object
 */
export const checkFirebaseStatus = () => {
  return {
    isInitialized: !!auth,
    apiKeyValid: !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10,
    authDomainValid: !!firebaseConfig.authDomain,
    projectIdValid: !!firebaseConfig.projectId
  };
};

/**
 * Log detailed Firebase initialization status
 */
export const logFirebaseInitStatus = () => {
  console.log("Firebase Auth Status:", {
    auth: !!auth,
    config: {
      apiKeyPresent: !!firebaseConfig.apiKey,
      apiKeyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    }
  });
};
