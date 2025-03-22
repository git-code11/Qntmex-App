import {
  Box,
  VStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function Register({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting to register user:", email);
      await register(email, password);
      console.log("Registration successful");
      // Registration successful
    } catch (error) {
      console.error("Registration error:", error);

      // Provide user-friendly error message
      let errorMessage = "Registration failed. Please try again later.";

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Try logging in instead.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Use at least 6 characters.";
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMessage = "Authentication service unavailable. Please try again later.";
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" py={8}>
      <VStack spacing={6} align="stretch" maxW="container.sm" mx="auto" p={4}>
        <VStack spacing={2}>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Create Account
          </Text>
          <Text color="gray.400" fontSize="sm">
            Enter your details to get started
          </Text>
        </VStack>

        <form onSubmit={handleRegister}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="gray.400">Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="gray.800"
                border="none"
                color="white"
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.400">Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="gray.800"
                border="none"
                color="white"
                required
                minLength={6}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.400">Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                bg="gray.800"
                border="none"
                color="white"
                required
                minLength={6}
              />
            </FormControl>

            <Button
              width="100%"
              colorScheme="blue"
              type="submit"
              isLoading={loading}
            >
              Create Account
            </Button>

            <Button
              width="100%"
              variant="ghost"
              color="gray.400"
              onClick={onBack}
            >
              Back to Login
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}

export default Register;