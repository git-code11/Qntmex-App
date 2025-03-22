
import React from 'react';
import { Box, VStack, Text, Button, Heading, Code, IconButton } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="gray.900"
          zIndex={1000}
          overflowY="auto"
          p={4}
        >
          <VStack spacing={6} align="stretch" maxW="container.sm" mx="auto">
            <IconButton
              icon={<ArrowBackIcon />}
              variant="ghost"
              colorScheme="red"
              alignSelf="flex-start"
              onClick={this.props.onBack}
            />
            
            <Heading color="red.500" size="lg">Something went wrong</Heading>
            
            <Text color="white">
              We encountered an error while trying to display this content. Please go back and try again.
            </Text>
            
            <Box bg="gray.800" p={4} borderRadius="md" borderLeft="4px solid" borderColor="red.500">
              <Text color="red.300" fontWeight="bold">Error:</Text>
              <Text color="white">{this.state.error && (this.state.error.toString())}</Text>
              
              {this.state.errorInfo && (
                <>
                  <Text color="red.300" fontWeight="bold" mt={4}>Component Stack:</Text>
                  <Code 
                    colorScheme="red" 
                    whiteSpace="pre-wrap" 
                    d="block" 
                    overflowX="auto" 
                    p={2} 
                    fontSize="xs"
                  >
                    {this.state.errorInfo.componentStack}
                  </Code>
                </>
              )}
            </Box>
            
            <Button 
              colorScheme="blue" 
              onClick={this.props.onBack || (() => window.location.reload())}
            >
              {this.props.onBack ? "Go Back" : "Reload Page"}
            </Button>
          </VStack>
        </Box>
      );
    }

    // If there's no error, render the children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
