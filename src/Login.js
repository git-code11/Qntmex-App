import { useState, useEffect } from "react";
import { Box, VStack, Input, Button, Text, useToast, HStack, IconButton, FormControl, FormLabel, InputGroup, InputRightElement } from "@chakra-ui/react";
import { ArrowBackIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "./AuthContext";
import { firebaseConfig, debugFirebaseConfig } from "./config";
import { auth } from "./firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Import directly from firebase/auth
import { logDetailedFirebaseStatus, debugLoginProcess } from "./utils/firebaseDebug";

function Login({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  // Check Firebase auth on component mount
  useEffect(() => {
    console.log("Login component mounted - checking Firebase auth status");
    const status = logDetailedFirebaseStatus();
    console.log("Firebase status on Login mount:", status);

    // Force refresh window.__FIREBASE_CONFIG__ if needed
    if (typeof window !== 'undefined' && !window.__FIREBASE_CONFIG__) {
      console.log("Injecting Firebase config into window");
      window.__FIREBASE_CONFIG__ = firebaseConfig;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Debug Firebase configuration
    console.log("Using Firebase API key:", firebaseConfig.apiKey ? "Key is present" : "No key found");

    // Check if Firebase is properly configured
    if (!firebaseConfig.apiKey) {
      console.error("Firebase configuration error - API key is missing");
      toast({
        title: "Service Unavailable",
        description: "Authentication service is not properly configured. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    console.log("Attempting to log in user:", email);

    try {
      // Debug Firebase status before login attempt
      await debugLoginProcess(email);

      // Verify Firebase auth is available
      if (!auth) {
        console.error("Firebase auth not initialized - attempting to get auth directly");
        // Get auth directly as a fallback 
        const directAuth = getAuth();
        if (directAuth) {
          // Try direct sign in with fallback auth
          const userCredential = await signInWithEmailAndPassword(directAuth, email, password);
          const user = userCredential.user;
          console.log("Login successful with direct auth:", user.email);
          // await login(email, password); //Removed as this line is redundant after direct login
        } else {
          throw new Error("Firebase authentication is not available");
        }
      } else {
        // Normal login flow
        await login(email, password);
      }

      setLoginSuccess(true);

      // CRITICAL: Clear ALL navigation flags before attempting login
      localStorage.removeItem('showLogin');
      localStorage.removeItem('showSplash');
      localStorage.removeItem('forceShowLogin');
      localStorage.removeItem('forcingLogout');

      // Log current Firebase config state
      console.log("Firebase config before login:", debugFirebaseConfig());

      // Wait a moment for overlay to render before login attempt
      await new Promise(resolve => setTimeout(resolve, 100));

      // Show success message
      toast({
        title: "Success",
        description: "Login successful!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // IMPORTANT: Set explicit flag to ensure we stay logged in
      localStorage.setItem('userAuthenticated', 'true');

      // Keep overlay visible during transition
      await new Promise(resolve => setTimeout(resolve, 600));

      // Now it's safe to navigate to the app - the AuthContext will handle the redirection
      console.log("Authentication successful - showing dashboard");

      // Force page refresh to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error("Login error in component:", error);

      let errorMessage = "Login failed. Please try again.";

      // Improved error handling with more specific messages
      if (error.code === 'auth/api-key-not-valid') {
        errorMessage = "System error: Authentication configuration issue. Please contact support.";
        console.error("Firebase API key validation error", { 
          error: error.message,
          code: error.code
        });
        // Log import config details
        import('./config').then(config => {
          console.log('Firebase config in Login component:', {
            hasApiKey: !!config.firebaseConfig.apiKey,
            apiKeyLength: config.firebaseConfig.apiKey ? config.firebaseConfig.apiKey.length : 0
          });
        });
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "Account not found. Please check your email or register.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format. Please check your email.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        status: "error",
        isClosable: true,
        position: "top",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Box minH="100vh" bg="gray.900" p={4} position="relative">
      {loginSuccess && (
        <Box 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          bg="rgba(0,0,0,0.7)" 
          zIndex="1500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          backdropFilter="blur(3px)"
          animation="fadeIn 0.3s ease-in-out"
        >
          <VStack spacing={3}>
            <Box 
              w="60px" 
              h="60px" 
              borderRadius="full" 
              border="3px solid" 
              borderColor="blue.400"
              borderBottomColor="transparent"
              animation="spin 1s linear infinite"
            />
            <Text color="blue.400" fontWeight="bold">Logging in...</Text>
          </VStack>
        </Box>
      )}
      <IconButton
        icon={<ArrowBackIcon />}
        variant="ghost"
        colorScheme="blue"
        aria-label="Back"
        onClick={onBack}
        position="absolute"
        top={4}
        left={4}
        zIndex="1"
      />

      <VStack spacing={8} maxW="md" mx="auto" pt={20}>
        <Text fontSize="3xl" color="white" fontWeight="bold">
          Log in to your wallet
        </Text>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel color="gray.400">Email</FormLabel>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                bg="gray.800"
                color="white"
                _placeholder={{ color: "gray.500" }}
                size="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.400">Password</FormLabel>
              <InputGroup>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                  bg="gray.800"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                  size="lg"
                />
                <InputRightElement h="full">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    variant="ghost"
                    onClick={togglePasswordVisibility}
                    color="gray.400"
                    _hover={{ color: "white" }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button 
              type="submit" 
              colorScheme="blue" 
              size="lg" 
              isLoading={loading}
              isFullWidth
              mt={2}
            >
              Log In
            </Button>
          </VStack>
        </form>

        <HStack spacing={1}>
          <Text color="gray.400">Don't have an account?</Text>
          <Button variant="link" color="blue.400" onClick={onBack}>
            Sign up
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default Login;