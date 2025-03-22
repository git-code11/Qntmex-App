
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Input,
  Text,
  useToast,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  ButtonGroup
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { getCoinData } from './api';

const AVAILABLE_COINS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'TON', name: 'Toncoin' },
  { symbol: 'TRX', name: 'TRON' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'USDC', name: 'USD Coin' }
];

export default function BuySell({ onClose }) {
  const [amount, setAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  const [currentCoin, setCurrentCoin] = useState('BTC');
  const [isBuying, setIsBuying] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const data = await getCoinData(currentCoin);
        setPrice(data.price);
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };
    fetchPrice();
  }, [currentCoin]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setUsdAmount((value * price).toFixed(2));
  };

  const handleUsdAmountChange = (e) => {
    const value = e.target.value;
    setUsdAmount(value);
    setAmount((value / price).toFixed(8));
  };

  const handleTransaction = async (type) => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to buy/sell crypto');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const value = ethers.utils.parseEther(amount.toString());

      const transaction = {
        to: type === 'buy' ? undefined : "EXCHANGE_ADDRESS",
        value: type === 'buy' ? value : '0',
        data: '0x',
      };

      const tx = await signer.sendTransaction(transaction);
      await tx.wait();

      toast({
        title: 'Success!',
        description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${currentCoin}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Transaction failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle close with flag check
  const handleClose = () => {
    // Don't clear the flag here - let the parent component handle it
    onClose();
  };

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
    >
      <VStack spacing={4} p={4}>
        <HStack w="100%" justify="space-between" mb={4}>
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={handleClose}
            variant="ghost"
            color="white"
          />
          <Text fontSize="xl" fontWeight="bold" color="white">
            {isBuying ? 'Buy' : 'Sell'} {currentCoin}
          </Text>
          <Box w="40px" />
        </HStack>

        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="gray.800" _hover={{ bg: "gray.700" }}>
            <HStack>
              <Image src={`/assets/coins/${currentCoin.toLowerCase()}.svg`} boxSize="24px" fallbackSrc="/assets/coins/generic.svg" />
              <Text>{currentCoin}</Text>
            </HStack>
          </MenuButton>
          <MenuList bg="gray.800">
            {AVAILABLE_COINS.map((coin) => (
              <MenuItem 
                key={coin.symbol}
                onClick={() => setCurrentCoin(coin.symbol)}
                bg="gray.800"
                _hover={{ bg: "gray.700" }}
              >
                <HStack>
                  <Image src={`/assets/coins/${coin.symbol.toLowerCase()}.svg`} boxSize="24px" fallbackSrc="/assets/coins/generic.svg" />
                  <Text>{coin.symbol} - {coin.name}</Text>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <ButtonGroup isAttached w="100%">
          <Button 
            onClick={() => setIsBuying(true)}
            colorScheme={isBuying ? "green" : "gray"}
            flex={1}
          >
            Buy
          </Button>
          <Button
            onClick={() => setIsBuying(false)}
            colorScheme={!isBuying ? "red" : "gray"}
            flex={1}
          >
            Sell
          </Button>
        </ButtonGroup>

        <VStack spacing={4} w="100%">
          <Input
            placeholder={`Amount in ${currentCoin}`}
            value={amount}
            onChange={handleAmountChange}
            type="number"
            color="white"
            bg="gray.800"
          />
          <Input
            placeholder="Amount in USD"
            value={usdAmount}
            onChange={handleUsdAmountChange}
            type="number"
            color="white"
            bg="gray.800"
          />
          <Text color="gray.400" fontSize="sm">
            1 {currentCoin} = ${price.toFixed(2)} USD
          </Text>
          <Button
            colorScheme={isBuying ? "green" : "red"}
            width="100%"
            onClick={() => handleTransaction(isBuying ? 'buy' : 'sell')}
            isLoading={loading}
          >
            {isBuying ? 'Buy' : 'Sell'} {currentCoin}
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
