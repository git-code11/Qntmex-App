import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Button,
  Image,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
import { CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ArrowsDownUp } from "@phosphor-icons/react";
import { getExchangeRate } from './api';

const AVAILABLE_COINS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'TON', name: 'Toncoin' },
  { symbol: 'TRX', name: 'TRON' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'USDT', name: 'Tether' }
];

export default function Swap({ onClose }) {
  const [sendCoin, setSendCoin] = useState('TON');
  const [receiveCoin, setReceiveCoin] = useState('USDT');
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [coinPrices, setCoinPrices] = useState({});

  const toast = useToast();
  const [exchangeRate, setExchangeRate] = useState(null);
const [estimatedGasFee, setEstimatedGasFee] = useState('0.00');

useEffect(() => {
  const estimateGasFee = async () => {
    try {
      // Simulated gas estimation - in production this would call the blockchain
      const baseGas = 0.001; // Base gas in ETH
      const currentGasPrice = Math.random() * (150 - 50) + 50; // Simulated gas price in GWEI
      const estimatedFee = baseGas * (currentGasPrice / 100);
      setEstimatedGasFee(estimatedFee.toFixed(4));
    } catch (error) {
      console.error('Error estimating gas:', error);
      setEstimatedGasFee('0.00');
    }
  };

  if (sendAmount && receiveCoin) {
    estimateGasFee();
  }
}, [sendAmount, receiveCoin]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const coins = [sendCoin, receiveCoin];
        const prices = {};
        for (const coin of coins) {
          const response = await getCoinData(coin);
          prices[coin] = response?.price || 0;
        }
        setCoinPrices(prices);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
    fetchPrices();
  }, [sendCoin, receiveCoin]);

  useEffect(() => {
    const updateRate = async () => {
      if (sendCoin && receiveCoin) {
        try {
          const rate = await getExchangeRate(sendCoin, receiveCoin);
          setExchangeRate(rate);
          if (sendAmount) {
            const calculatedAmount = (parseFloat(sendAmount) * rate).toFixed(6);
            setReceiveAmount(calculatedAmount);
          }
        } catch (error) {
          console.error('Error updating exchange rate:', error);
          toast({
            title: "Error fetching rate",
            description: "Using fallback exchange rate",
            status: "warning",
            duration: 3000,
          });
        }
      }
    };
    
    updateRate();
    const interval = setInterval(updateRate, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [sendAmount, sendCoin, receiveCoin]);

  const [slippage, setSlippage] = useState(0.5); // Default 0.5%
  const [isConfirming, setIsConfirming] = useState(false);
  
  const handleSwap = async () => {
    try {
      setIsConfirming(true);
      const minReceived = (parseFloat(receiveAmount) * (1 - slippage / 100)).toFixed(6);
      
      const result = await sendTransaction(
        'your-address',
        'swap-contract-address',
        sendAmount,
        sendCoin,
        {
          slippage,
          minReceived,
          expectedRate: exchangeRate
        }
      );
      
      if (result.success) {
        toast({
          title: "Swap successful",
          description: `Swapped ${sendAmount} ${sendCoin} for ${receiveAmount} ${receiveCoin}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setSendAmount('');
        setReceiveAmount('');
      }
    } catch (error) {
      toast({
        title: "Swap failed",
        description: error.message || "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
          <IconButton
            icon={<CloseIcon />}
            variant="ghost"
            color="white"
            onClick={handleClose}
            size="sm"
          />
          <Text fontSize="xl" color="white">Swap</Text>
          <Box w="40px"/>

        </HStack>

        <Box bg="gray.800" p={4} borderRadius="xl">
          <VStack align="stretch">
            <HStack justify="space-between">
              <Text color="gray.400">Send</Text>
              <Text color="gray.400">Balance: 0</Text>
            </HStack>
            <HStack>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="gray.700" _hover={{ bg: 'gray.600' }}>
                  <HStack>
                    <Image src={`/assets/coins/${sendCoin.toLowerCase()}.svg`} boxSize="24px" />
                    <Text color="white">{sendCoin}</Text>
                  </HStack>
                </MenuButton>
                <MenuList bg="gray.800" borderColor="gray.700">
                  {AVAILABLE_COINS.filter(coin => coin.symbol !== receiveCoin).map((coin) => (
                    <MenuItem
                      key={coin.symbol}
                      onClick={() => setSendCoin(coin.symbol)}
                      bg="gray.800"
                      _hover={{ bg: 'gray.700' }}
                    >
                      <HStack>
                        <Image src={`/assets/coins/${coin.symbol.toLowerCase()}.svg`} boxSize="24px" />
                        <Text color="white">{coin.symbol}</Text>
                        <Text color="gray.400" fontSize="sm">({coin.name})</Text>
                      </HStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <Input
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0"
                border="none"
                color="white"
                textAlign="right"
                w="120px"
                ml="auto"
              />
            </HStack>
            <Text color="gray.500" textAlign="right">≈ ${((coinPrices?.[sendCoin] || 0) * (parseFloat(sendAmount) || 0)).toFixed(2)}</Text>
          </VStack>
        </Box>

        <Box position="relative" h="40px">
          {exchangeRate && (
            <VStack spacing={1} position="absolute" width="100%" top="-24px">
              <Text color="gray.500" fontSize="sm" textAlign="center">
                1 {sendCoin} = {exchangeRate.toFixed(4)} {receiveCoin}
              </Text>
              <Text color="gray.500" fontSize="xs" textAlign="center">
                Estimated Gas Fee: ${estimatedGasFee} USD
              </Text>
            </VStack>
          )}
          <IconButton
            icon={<ArrowsDownUp />}
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            rounded="full"
            bg="gray.700"
            color="white"
            onClick={() => {
              const temp = sendCoin;
              setSendCoin(receiveCoin);
              setReceiveCoin(temp);
              setSendAmount('');
              setReceiveAmount('');
            }}
          />
        </Box>

        <Box bg="gray.800" p={4} borderRadius="xl">
          <VStack align="stretch">
            <HStack justify="space-between">
              <Text color="gray.400">Receive</Text>
              <Text color="gray.400">Balance: 0</Text>
            </HStack>
            <HStack>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="gray.700" _hover={{ bg: 'gray.600' }}>
                  <HStack>
                    <Image src={`/assets/coins/${receiveCoin.toLowerCase()}.svg`} boxSize="24px" />
                    <Text color="white">{receiveCoin}</Text>
                  </HStack>
                </MenuButton>
                <MenuList bg="gray.800" borderColor="gray.700">
                  {AVAILABLE_COINS.filter(coin => coin.symbol !== sendCoin).map((coin) => (
                    <MenuItem
                      key={coin.symbol}
                      onClick={() => setReceiveCoin(coin.symbol)}
                      bg="gray.800"
                      _hover={{ bg: 'gray.700' }}
                    >
                      <HStack>
                        <Image src={`/assets/coins/${coin.symbol.toLowerCase()}.svg`} boxSize="24px" />
                        <Text color="white">{coin.symbol}</Text>
                        <Text color="gray.400" fontSize="sm">({coin.name})</Text>
                      </HStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <Input
                value={receiveAmount}
                readOnly
                placeholder="0"
                border="none"
                color="white"
                textAlign="right"
                w="120px"
                ml="auto"
              />
            </HStack>
            <Text color="gray.500" textAlign="right">≈ ${receiveAmount}</Text>
          </VStack>
        </Box>

        <Button
          position="fixed"
          bottom={4}
          left={4}
          right={4}
          colorScheme="blue"
          isDisabled={!sendAmount || parseFloat(sendAmount) <= 0}
          onClick={handleSwap}
        >
          {parseFloat(sendAmount) > 0 ? 'Swap' : 'Not enough funds'}
        </Button>
      </VStack>
    </Box>
  );
}