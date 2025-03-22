import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { sendTransaction } from './api';
import { useToast } from '@chakra-ui/react'


const coins = [
  { symbol: 'TON', image: '/assets/coins/ton.svg' },
  { symbol: 'USDT', image: '/assets/coins/usdt.svg' },
  { symbol: 'BTC', image: '/assets/coins/btc.svg' },
  { symbol: 'ETH', image: '/assets/coins/eth.svg' },
];

export default function Send({ onClose, selectedCoin: initialCoin }) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [selectedCoin, setSelectedCoin] = useState(() => {
    const storedCoin = window.localStorage.getItem('selectedCoinForAction');
    if (storedCoin) {
      window.localStorage.removeItem('selectedCoinForAction');
      const found = coins.find(c => c.symbol === storedCoin);
      if (found) return found;
    }
    if (initialCoin) {
      const found = coins.find(c => c.symbol === initialCoin);
      if (found) return found;
    }
    return coins[0];
  });

  const handleSend = async () => {
    setIsLoading(true);
    setStatus('');
    try {
      if (!address || !amount || !selectedCoin) {
        throw new Error('Please fill in all fields');
      }

      const result = await sendTransaction(
        'your-wallet-address',
        address,
        parseFloat(amount),
        selectedCoin.symbol
      );

      if (result.success) {
        const transaction = {
          type: 'Send',
          amount: `-${amount} ${selectedCoin.symbol}`,
          date: new Date().toISOString().split('T')[0],
          status: 'Completed',
          address: address,
          txHash: result.txHash
        };
        const history = JSON.parse(localStorage.getItem('transactions') || '[]');
        history.unshift(transaction);
        localStorage.setItem('transactions', JSON.stringify(history));
        setStatus('success');
        toast({
          title: 'Transaction Successful',
          description: `Successfully sent ${amount} ${selectedCoin.symbol}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      console.error('Send transaction failed:', error);
      setStatus('error');
      toast({
        title: 'Transaction Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="gray.900"
      zIndex={1000}
      p={4}
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" alignItems="center">
          <Box w="40px"/>
          <Text fontSize="xl" fontWeight="bold" color="white" textAlign="center">Send</Text>
          <IconButton
            icon={<CloseIcon />}
            variant="ghost"
            color="white"
            onClick={handleClose}
            size="sm"
          />
        </HStack>

        <Box bg="gray.800" borderRadius="xl" p={3}>
          <HStack>
            <Input
              placeholder="Address or name"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              bg="transparent"
              border="none"
              color="white"
              _placeholder={{ color: 'gray.500' }}
            />
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handlePaste}
            >
              Paste
            </Button>
          </HStack>
        </Box>

        <Box bg="gray.800" borderRadius="xl" p={3}>
          <HStack justify="space-between">
            <Input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              bg="transparent"
              border="none"
              color="white"
              _placeholder={{ color: 'gray.500' }}
            />
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="transparent" _hover={{ bg: 'gray.700' }}>
                <HStack>
                  <Image src={selectedCoin.image} boxSize="24px" />
                  <Text color="white">{selectedCoin.symbol}</Text>
                </HStack>
              </MenuButton>
              <MenuList bg="gray.800" borderColor="gray.700">
                {coins.map((coin) => (
                  <MenuItem
                    key={coin.symbol}
                    onClick={() => setSelectedCoin(coin)}
                    bg="gray.800"
                    _hover={{ bg: 'gray.700' }}
                  >
                    <HStack>
                      <Image src={coin.image} boxSize="24px" />
                      <Text color="white">{coin.symbol}</Text>
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        <HStack justify="space-between" px={2}>
          <Text color="gray.500">USD 0↓↑</Text>
          <Text color="gray.500">Remaining: 0 {selectedCoin.symbol} MAX</Text>
        </HStack>

        <Input
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          bg="gray.800"
          border="none"
          color="white"
          _placeholder={{ color: 'gray.500' }}
          p={3}
          borderRadius="xl"
        />

        {status === 'success' && (
          <Text color="green.400" textAlign="center" mb={4}>
            Transaction successful! ✓
          </Text>
        )}
        {status === 'error' && (
          <Text color="red.400" textAlign="center" mb={4}>
            Transaction failed. Please try again.
          </Text>
        )}

        <Button
          colorScheme="blue"
          size="lg"
          position="fixed"
          bottom={4}
          left={4}
          right={4}
          isDisabled={!address || !amount || isLoading}
          isLoading={isLoading}
          onClick={handleSend}
        >
          {!address || !amount ? 'Enter amount and address' : 'Continue'}
        </Button>
      </VStack>
    </Box>
  );
}