
import { Box, VStack, Text, Button, Image } from "@chakra-ui/react";

function SplashScreen({ onGetStarted, onLogin }) {
  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
      position="relative"
      overflow="hidden"
    >
      <VStack 
        spacing={8} 
        justify="center" 
        align="center" 
        height="100vh"
        position="relative"
        px={4}
      >
        <VStack spacing={3}>
          <Text
            fontSize="4xl"
            fontWeight="bold"
            color="white"
            textAlign="center"
            lineHeight="1.2"
          >
            Crypto Just Got
            <br />
            Easier!
          </Text>
          <Text
            color="gray.300"
            textAlign="center"
            fontSize="md"
          >
            Experience seamless trading
            <br />
            and secure asset management
          </Text>
        </VStack>

        <VStack spacing={4} width="100%" maxW="300px" mt={8}>
          <Button
            width="100%"
            size="lg"
            colorScheme="blue"
            onClick={onGetStarted}
          >
            Get Started
          </Button>
          <Button
            width="100%"
            size="lg"
            variant="outline"
            color="white"
            _hover={{ bg: "whiteAlpha.100" }}
            onClick={onLogin}
          >
            Log In
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}

export default SplashScreen;
