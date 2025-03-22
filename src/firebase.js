
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Log Firebase configuration status
console.log("Firebase Config for initialization:", {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 5)}...` : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING',
  storageBucket: firebaseConfig.storageBucket || 'MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
  appId: firebaseConfig.appId ? 'Present' : 'MISSING'
});

// Initialize Firebase app with error handling
let app;
let auth;
let db;

// Try to get a valid Firebase configuration
const getValidFirebaseConfig = () => {
  // First check if firebaseConfig from config.js is valid
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
    console.log("Using Firebase config from config.js");
    return firebaseConfig;
  }
  
  // Next try window.__FIREBASE_CONFIG__ in deployed env
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__ && 
      window.__FIREBASE_CONFIG__.apiKey && 
      window.__FIREBASE_CONFIG__.authDomain && 
      window.__FIREBASE_CONFIG__.projectId) {
    console.log("Using Firebase config from window.__FIREBASE_CONFIG__");
    return window.__FIREBASE_CONFIG__;
  }
  
  // Check environment variables directly
  if (typeof window !== 'undefined') {
    if (window.REACT_APP_FIREBASE_API_KEY && 
        window.REACT_APP_FIREBASE_AUTH_DOMAIN && 
        window.REACT_APP_FIREBASE_PROJECT_ID) {
      console.log("Using Firebase config from window environment variables");
      return {
        apiKey: window.REACT_APP_FIREBASE_API_KEY,
        authDomain: window.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: window.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: window.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: window.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: window.REACT_APP_FIREBASE_APP_ID || ""
      };
    }
  }
  
  // Check process.env directly
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.REACT_APP_FIREBASE_API_KEY && 
        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN && 
        process.env.REACT_APP_FIREBASE_PROJECT_ID) {
      console.log("Using Firebase config from process.env");
      return {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.REACT_APP_FIREBASE_APP_ID || ""
      };
    }
  }
  
  // Use emergency hardcoded config as last resort
  console.warn("Using emergency Firebase config - all other config attempts failed");
  return {
    apiKey: "AIzaSyAXRaee-MKecRMD54lr8labcVT-Urp5e_g",
    authDomain: "qntm-43b47.firebaseapp.com",
    projectId: "qntm-43b47",
    storageBucket: "qntm-43b47.firebasestorage.app",
    messagingSenderId: "822203561811",
    appId: "1:822203561811:web:da7949e62b1b3d4423d3a6"
  };
};

try {
  // Get a valid configuration
  const validConfig = getValidFirebaseConfig();
  
  // Initialize Firebase with the valid config
  app = initializeApp(validConfig);
  console.log("Firebase app initialized with name:", app.name);
  
  // Get authentication service
  auth = getAuth(app);
  console.log("Firebase auth ready:", !!auth);
  
  // Get Firestore database 
  db = getFirestore(app);
  console.log("Firebase Firestore ready:", !!db);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  
  // Create empty fallback objects if Firebase initialization fails
  // This prevents null reference errors in the rest of the app
  if (!auth) {
    console.warn("Creating mock auth object to prevent crashes");
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback) => {
        console.warn("Using mock onAuthStateChanged");
        callback(null);
        return () => {};
      },
      signInWithEmailAndPassword: () => {
        console.error("Firebase auth not available");
        return Promise.reject(new Error("Firebase authentication is not available"));
      },
      createUserWithEmailAndPassword: () => {
        console.error("Firebase auth not available");
        return Promise.reject(new Error("Firebase authentication is not available"));
      },
      signOut: () => {
        console.error("Firebase auth not available");
        return Promise.resolve();
      }
    };
  }
  
  if (!db) {
    console.warn("Creating mock db object to prevent crashes");
    db = {
      collection: () => ({
        doc: () => ({
          get: () => Promise.resolve({ exists: false, data: () => ({}) }),
          set: () => Promise.resolve()
        })
      })
    };
  }
}

// Export Firebase instances
export { auth, db };
