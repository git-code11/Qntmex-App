import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { firebaseConfig } from "./config"; // Added import for Firebase config

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const createUserWallet = async () => {
    try {
      const { createWallet } = require('./services/alchemyService');
      const newWallet = await createWallet();
      // Store wallet info securely - in a production app, you should encrypt the private key
      localStorage.setItem(`wallet_${user.uid}`, JSON.stringify(newWallet));
      setWallet(newWallet);
      return newWallet;
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  };

  const loadUserWallet = () => {
    if (!user) return null;
    try {
      const walletData = localStorage.getItem(`wallet_${user.uid}`);
      if (walletData) {
        const loadedWallet = JSON.parse(walletData);
        setWallet(loadedWallet);
        return loadedWallet;
      }
      return null;
    } catch (error) {
      console.error("Error loading wallet:", error);
      return null;
    }
  };

  useEffect(() => {
    // Set a block flag to prevent any auth state changes during initialization
    let isInitializing = !initialized;
    
    if (isInitializing) {
      // On first load, set splash as default if no flags exist
      if (!localStorage.getItem('showLogin') && !localStorage.getItem('showSplash') && !localStorage.getItem('userAuthenticated')) {
        localStorage.setItem('showSplash', 'true');
      }
      setInitialized(true);
    }
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, authUser => {
      console.log("Auth state changed - User:", authUser?.uid || "none", "Initializing:", isInitializing);
      
      // If we're handling a forced logout, don't process auth state changes
      const forcedLogout = localStorage.getItem('forcingLogout') === 'true';
      if (forcedLogout) {
        console.log("Ignoring auth state change during forced logout");
        return;
      }
      
      // Check if we just successfully logged in
      const userAuthenticated = localStorage.getItem('userAuthenticated') === 'true';
      
      // If we have a 'forceShowLogin' flag during login, always show login
      const forceShowLogin = localStorage.getItem('forceShowLogin') === 'true';
      if (forceShowLogin) {
        console.log("Force showing login - ignoring auth state");
        setUser(null);
        setLoading(false);
        return;
      }
      
      const showLoginFlag = localStorage.getItem('showLogin') === 'true';
      const showSplashFlag = localStorage.getItem('showSplash') === 'true';
      
      // PRIORITY STATE MANAGEMENT:
      // 1. If user is authenticated in Firebase, always show dashboard
      // 2. If userAuthenticated flag is set, show dashboard (backup in case Firebase auth state is delayed)
      // 3. If showLogin flag is set, show login screen
      // 4. If showSplash flag is set, show splash screen
      // 5. Default to splash screen
      
      if (authUser) {
        console.log("Authenticated user detected - showing dashboard");
        setUser(authUser);
        // Clear ALL navigation flags
        localStorage.removeItem('showLogin');
        localStorage.removeItem('showSplash');
        localStorage.removeItem('forceShowLogin');
        localStorage.setItem('userAuthenticated', 'true');
        setLoading(false);
      } else if (userAuthenticated) {
        console.log("User authenticated flag set - waiting for Firebase auth state");
        // Keep loading until Firebase auth state catches up
        setLoading(true);
      } else if (showLoginFlag) {
        console.log("Login flag set - showing login screen");
        setUser(null);
        localStorage.removeItem('showSplash');
        localStorage.removeItem('userAuthenticated');
        setLoading(false);
      } else if (showSplashFlag) {
        console.log("Splash flag set - showing splash screen");
        setUser(null);
        localStorage.removeItem('userAuthenticated');
        setLoading(false);
      } else {
        // Default fallback - show splash
        console.log("No flags set - defaulting to splash screen");
        setUser(null);
        localStorage.setItem('showSplash', 'true');
        localStorage.removeItem('userAuthenticated');
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [initialized]);

  async function register(email, password) {
    if (!auth) {
      throw new Error("Firebase authentication is not initialized");
    }
    try {
      console.log("Starting registration with:", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registration successful, creating wallet...");

      setUser(userCredential.user);

      // Create a wallet for the new user
      try {
        const newWallet = await createUserWallet();
        console.log("Wallet created successfully:", newWallet);
      } catch (walletError) {
        console.error("Error creating wallet after registration:", walletError);
        // Continue despite wallet error - user is still registered
      }

      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error; // Pass the original error through
    }
  }

  async function login(email, password) {
    try {
      console.log("Starting login process with:", email);

      // Simple check for auth object
      if (!auth) {
        console.error("Auth object is not initialized");
        throw new Error("Authentication service unavailable");
      }

      // Verify Firebase config
      if (!firebaseConfig.apiKey) {
        console.error("Firebase API key is missing");
        throw new Error("Authentication configuration error. Please contact support.");
      }
      
      // CRITICAL: Clear ALL navigation flags completely before login
      localStorage.removeItem('showLogin');
      localStorage.removeItem('showSplash');
      localStorage.removeItem('forceShowLogin');
      localStorage.removeItem('forcingLogout');
      
      // Attempt login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful with user:", userCredential.user.uid);
      
      // Set user state to trigger app to show dashboard
      setUser({...userCredential.user});
      
      // Load wallet data right after login
      setTimeout(() => {
        try {
          loadUserWallet();
        } catch (e) {
          console.error("Error loading wallet after login:", e);
        }
      }, 100);
      
      console.log("User authenticated and state updated");
      return userCredential.user;
    } catch (error) {
      // Log the full error object for debugging
      console.error("Login error:", error);

      // Handle specific Firebase errors with user-friendly messages
      if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
        console.error("Firebase API key error:", {
          apiKeyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0,
          authDomain: firebaseConfig.authDomain
        });
        // Log additional debugging information
        console.log("Full Firebase config available:", Object.keys(firebaseConfig).join(', '));
        throw new Error("Authentication configuration error. Please contact support.");
      } else if (error.code === 'auth/user-not-found') {
        throw new Error("Account not found. Please check your email or register.");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many attempts. Please try again later.");
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error("Login failed: " + (error.message || "Please try again later."));
      }
    }
  }

  async function logout() {
    try {
      console.log("Starting logout process");
      
      // Set a flag to block auth state changes during logout
      localStorage.setItem('forcingLogout', 'true');
      
      // Clear all authentication flags first
      localStorage.removeItem('userAuthenticated');
      
      // Set login screen flag
      localStorage.setItem('showLogin', 'true');
      localStorage.removeItem('showSplash');
      
      // Clear user wallet from local storage
      if (user) {
        localStorage.removeItem(`wallet_${user.uid}`);
      }
      
      // Clear user state first (this will trigger UI updates)
      setUser(null);
      setWallet(null);
      
      // Then perform the actual Firebase signOut
      await signOut(auth);
      
      // Clear the block flag after logout is complete
      localStorage.removeItem('forcingLogout');
      
      console.log("Logout completed successfully");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem('forcingLogout');
      throw error;
    }
  }

  const value = {
    user,
    wallet,
    register,
    login,
    logout,
    createUserWallet,
    loadUserWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}