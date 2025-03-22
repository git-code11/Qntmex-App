import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Input, Button, IconButton,
  FormControl, FormLabel, useToast, Divider, Spinner, Heading,
  Alert, AlertIcon, FormHelperText
} from "@chakra-ui/react";
import { ArrowBackIcon, CopyIcon, CloseIcon } from "@chakra-ui/icons";
import { useAuth } from "./AuthContext";
import { ethers } from 'ethers';
import { getBalance } from './services/alchemyService';
import ErrorBoundary from './components/ErrorBoundary';

function EthTester({ onBack }) {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [testAddress, setTestAddress] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [amount, setAmount] = useState('0.001');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [testResult, setTestResult] = useState('');
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load wallet when component mounts
    if (user) {
      loadWallet();
    }
  }, [user]);

  const loadWallet = () => {
    try {
      const walletData = localStorage.getItem(`wallet_${user.uid}`);
      if (!walletData) {
        toast({
          title: "Wallet not found",
          description: "Please use the main app to create a wallet first",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      const loadedWallet = JSON.parse(walletData);
      setWallet(loadedWallet);

      // Get balance
      fetchBalance(loadedWallet.address);
    } catch (error) {
      console.error("Error loading wallet:", error);
      toast({
        title: "Error loading wallet",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchBalance = async (address) => {
    try {
      const ethBalance = await getBalance(address);
      setBalance(ethBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error fetching balance");
    }
  };

  // Check if an address is a valid Ethereum address
  const isValidAddress = (addr) => {
    try {
      return ethers.utils.isAddress(addr);
    } catch {
      return false;
    }
  };

  const simulateTransaction = async () => {
    setIsLoading(true);
    setTxHash('');
    setTestResult('');

    try {
      if (!wallet) {
        throw new Error('Wallet not loaded');
      }

      if (!isValidAddress(testAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      // Create test transaction object
      const testTx = {
        from: wallet.address,
        to: testAddress,
        value: ethers.utils.parseEther(amount),
        nonce: Math.floor(Math.random() * 1000), // Simulate nonce
        gasLimit: ethers.utils.hexlify(100000),   // Simulate gas limit
        gasPrice: ethers.utils.parseUnits("10", "gwei"),
      };

      // Generate fake transaction hash
      const fakeTxHash = '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTxHash(fakeTxHash);
      setTestResult('Success! This simulation confirms your Ethereum address is valid and properly formatted.');

      // Add to transaction history
      const history = JSON.parse(localStorage.getItem('transactions') || '[]');
      history.unshift({
        type: 'Test Send',
        amount: `-${amount} ETH`,
        date: new Date().toISOString().split('T')[0],
        status: 'Simulated',
        address: testAddress,
        txHash: fakeTxHash,
        details: `TEST ONLY: Simulated sending ${amount} ETH to ${testAddress.slice(0, 6)}...${testAddress.slice(-4)}`
      });
      localStorage.setItem('transactions', JSON.stringify(history));

      toast({
        title: "Transaction simulated",
        description: `Test transaction of ${amount} ETH created successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error simulating transaction:", error);
      setTestResult(`Error: ${error.message}`);

      toast({
        title: "Simulation failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  return (
    <ErrorBoundary onBack={onBack}>
      <Box 
        position="fixed" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        bg="gray.900" 
        zIndex={2000}
        p={4}
        overflowY="auto"
      >
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" alignItems="center">
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onBack}
              variant="ghost"
              color="white"
            />
            <Heading fontSize="xl" color="white" textAlign="center">ETH Transaction Tester</Heading>
            <Box w="40px" />
          </HStack>

          <Alert status="info" borderRadius="md" bg="blue.800" color="white">
            <AlertIcon color="blue.200" />
            This tool lets you test if an ETH address is valid without sending actual crypto.
          </Alert>

          <Box bg="gray.800" borderRadius="xl" p={4}>
            <VStack align="stretch" spacing={4}>
              <Text color="white" fontWeight="bold">Your Wallet Info</Text>

              <HStack>
                <Text color="gray.400">Address:</Text>
                <Text color="white" isTruncated>
                  {wallet ? wallet.address : 'Loading...'}
                </Text>
                {wallet && (
                  <IconButton
                    icon={<CopyIcon />}
                    size="sm"
                    variant="ghost"
                    color="blue.400"
                    onClick={() => copyToClipboard(wallet.address)}
                  />
                )}
              </HStack>

              <HStack>
                <Text color="gray.400">Balance:</Text>
                <Text color="white">
                  {balance !== null ? `${balance} ETH` : 'Loading...'}
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Box bg="gray.800" borderRadius="xl" p={4}>
            <VStack align="stretch" spacing={4}>
              <Text color="white" fontWeight="bold">Test ETH Transaction (No real ETH used)</Text>

              <FormControl>
                <FormLabel color="gray.400">Test Recipient Address</FormLabel>
                <Input
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="Enter recipient ETH address"
                  bg="gray.700"
                  color="white"
                  border="none"
                  isInvalid={testAddress && !isValidAddress(testAddress)}
                />
                <FormHelperText color="gray.400">
                  Enter the destination ETH address to test
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.400">Test Amount (ETH)</FormLabel>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to send"
                  bg="gray.700"
                  color="white"
                  border="none"
                  type="number"
                  step="0.001"
                />
                <FormHelperText color="gray.400">
                  Simulated amount (no real crypto will be sent)
                </FormHelperText>
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={simulateTransaction}
                isLoading={isLoading}
                loadingText="Simulating..."
                disabled={!wallet || isLoading}
              >
                Simulate Transaction
              </Button>

              {isLoading && (
                <HStack justify="center" spacing={3}>
                  <Spinner color="blue.400" />
                  <Text color="blue.400">Processing simulation...</Text>
                </HStack>
              )}

              {txHash && (
                <Box bg="gray.700" p={3} borderRadius="md">
                  <Text color="gray.400" fontSize="sm">Test Transaction Hash:</Text>
                  <HStack>
                    <Text color="green.400" fontSize="sm" isTruncated>{txHash}</Text>
                    <IconButton
                      icon={<CopyIcon />}
                      size="xs"
                      variant="ghost"
                      color="blue.400"
                      onClick={() => copyToClipboard(txHash)}
                    />
                  </HStack>
                </Box>
              )}

              {testResult && (
                <Text 
                  color={testResult.includes('Error') ? "red.400" : "green.400"} 
                  fontSize="sm"
                >
                  {testResult}
                </Text>
              )}
            </VStack>
          </Box>

          <Box bg="gray.800" borderRadius="xl" p={4}>
            <Text color="white" fontWeight="bold" mb={2}>Why use the Test Tool?</Text>
            <VStack align="stretch" spacing={2}>
              <Text color="gray.400" fontSize="sm">• Verify your wallet address format is correct</Text>
              <Text color="gray.400" fontSize="sm">• Check that transaction creation flows properly</Text>
              <Text color="gray.400" fontSize="sm">• Test UI functionality without spending real ETH</Text>
              <Text color="gray.400" fontSize="sm">• View test transactions in your transaction history</Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </ErrorBoundary>
  );
}

export default EthTester;