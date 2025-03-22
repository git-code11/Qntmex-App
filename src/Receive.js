
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Input,
  Image,
  useClipboard,
} from "@chakra-ui/react";
import { CloseIcon, CopyIcon } from "@chakra-ui/icons";
import { useAuth } from './AuthContext';
import { QRCodeSVG as QRCode } from 'qrcode.react';

export default function Receive({ onClose, selectedCoin }) {
  const { user } = useAuth();
  
  const getCoinAddress = (coin) => {
    // Testnet addresses for testing
    const addresses = {
      'BTC': 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', // Bitcoin Testnet
      'ETH': '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', // Goerli Testnet
      'TON': 'kQBfAN7LfaUYgXZNw5Wc7GBgkEX2yhuJ5ka95J1j_2OpQkLT', // TON Testnet
      'TRX': 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs', // Tron Testnet (Shasta)
      'SOL': '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Solana Devnet
      'USDT': '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', // Goerli Testnet
      'XRP': 'rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh', // XRP Testnet
      'USDC': '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'  // Goerli Testnet
    };
    return addresses[coin] || "Connect wallet to view address";
  };

  const walletAddress = getCoinAddress(selectedCoin);
  
  const handleReceive = async (amount, coin) => {
    const transaction = {
      type: 'Receive',
      amount: `+${amount} ${coin}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      address: walletAddress,
      txHash: '0x' + Math.random().toString(16).slice(2),
      details: `Received ${amount} ${coin}`
    };
    
    const history = JSON.parse(localStorage.getItem('transactions') || '[]');
    history.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(history));
  };
  const { hasCopied, onCopy } = useClipboard(walletAddress);

  // Handle close with flag check
  const handleClose = () => {
    // Don't clear the flag here - let the parent component handle it
    onClose();
  };

  return (
    <Box position="fixed" top="0" left="0" right="0" bottom="0" bg="gray.900" zIndex={1000} p={4}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" alignItems="center">
          <IconButton
            icon={<CloseIcon />}
            variant="ghost"
            color="white"
            onClick={handleClose}
            size="sm"
          />
          <Text fontSize="xl" color="white">Receive</Text>
          <Box w="40px"/>
        </HStack>

        <VStack spacing={4} align="center">
          <Box bg="white" p={4} borderRadius="xl">
            <QRCode value={walletAddress} size={200} />
          </Box>
          
          <HStack w="full" bg="gray.800" p={2} borderRadius="lg">
            <Text color="white" flex={1}>{walletAddress}</Text>
            <IconButton
              icon={<CopyIcon />}
              onClick={onCopy}
              variant="ghost"
              color={hasCopied ? "green.500" : "blue.500"}
              aria-label="Copy address"
            />
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
