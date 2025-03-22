import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Text, 
  Input, 
  Button, 
  FormControl,
  FormLabel,
  Select,
  useToast
} from "@chakra-ui/react";
import { sendTransaction } from '../services/alchemyService';
import { useAuth } from '../AuthContext';

function WalletTester() {
  const [amount, setAmount] = useState('0.001');
  const [coin, setCoin] = useState('ETH');
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const simulateSend = async () => {
    setIsLoading(true);
    setTxHash('');

    try {
      // Get wallet from localStorage
      const walletData = localStorage.getItem(`wallet_${user.uid}`);
      if (!walletData) {
        throw new Error('Wallet not found');
      }

      const wallet = JSON.parse(walletData);

      // Random test address
      const toAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      // Send transaction
      const result = await sendTransaction(
        wallet.privateKey,
        toAddress,
        parseFloat(amount)
      );

      setTxHash(result.hash);

      // Add to transaction history
      const history = JSON.parse(localStorage.getItem('transactions') || '[]');
      history.unshift({
        type: 'Send',
        amount: `-${amount} ${coin}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        address: toAddress,
        txHash: result.hash,
        details: `Sent ${amount} ${coin} to ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`
      });
      localStorage.setItem('transactions', JSON.stringify(history));

      toast({
        title: 'Transaction simulated',
        description: `Sent ${amount} ${coin}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: 'Transaction failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateReceive = async () => {
    setIsLoading(true);
    setTxHash('');

    try {
      // Get wallet from localStorage
      const walletData = localStorage.getItem(`wallet_${user.uid}`);
      if (!walletData) {
        throw new Error('Wallet not found');
      }

      const wallet = JSON.parse(walletData);

      // Generate mock tx hash
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 10)}`;
      setTxHash(mockTxHash);

      // Add to transaction history
      const history = JSON.parse(localStorage.getItem('transactions') || '[]');
      history.unshift({
        type: 'Receive',
        amount: `+${amount} ${coin}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        address: '0x8472Ec9D51cEF3b4e7Ed28f025AE94Da7f7fc27c', // Random sender
        txHash: mockTxHash,
        details: `Received ${amount} ${coin}`
      });
      localStorage.setItem('transactions', JSON.stringify(history));

      toast({
        title: 'Receive transaction simulated',
        description: `Received ${amount} ${coin}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: 'Simulation failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={5} bg="gray.800" borderRadius="lg" color="white" mb={4}>
      <Text fontSize="xl" mb={4}>Wallet Transaction Tester</Text>

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Amount</FormLabel>
          <Input 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount" 
            type="number"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Coin/Token</FormLabel>
          <Select value={coin} onChange={(e) => setCoin(e.target.value)}>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
            <option value="DAI">DAI</option>
            <option value="LINK">LINK</option>
            <option value="UNI">UNI</option>
            <option value="WBTC">WBTC</option>
          </Select>
        </FormControl>

        <HStack spacing={4}>
          <Button 
            colorScheme="green" 
            onClick={simulateReceive} 
            width="50%" 
            isLoading={isLoading}
          >
            Simulate Receive
          </Button>
          <Button 
            colorScheme="red" 
            onClick={simulateSend} 
            width="50%" 
            isLoading={isLoading}
          >
            Simulate Send
          </Button>
        </HStack>

        {txHash && (
          <Text mt={2}>
            Transaction Hash: {txHash}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default WalletTester;