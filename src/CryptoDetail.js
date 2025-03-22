
import { Box, VStack, Text, Button, HStack, IconButton, Divider, Image, useColorMode, SimpleGrid } from "@chakra-ui/react";
import { ArrowBackIcon, ArrowUpIcon, ArrowDownIcon, RepeatIcon, InfoIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import PriceChart from "./PriceChart";
import { getMarketData } from "./api";

const CryptoDetail = ({ onBack, selectedCoin }) => {
  const [timeframe, setTimeframe] = useState("1d");
  const [price, setPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [coinData, setCoinData] = useState(null);
  
  const [chartData, setChartData] = useState(null);
  const [isChartLoading, setIsChartLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching coin data and chart data
    const fetchCoinData = async () => {
      try {
        setIsChartLoading(true);
        // In production, replace with actual API call
        const mockPrices = {
          'BTC': { price: 62453, change: 2.4 },
          'ETH': { price: 3241, change: -1.2 },
          'TON': { price: 5.7, change: 3.8 },
          'SOL': { price: 142, change: 5.2 },
          'TRX': { price: 0.13, change: 0.5 },
          'USDT': { price: 1.00, change: 0.01 },
          'USDC': { price: 1.00, change: 0.00 },
          'XRP': { price: 0.54, change: -0.3 }
        };
        
        // Get data for the selected coin, or use a fallback
        const data = mockPrices[selectedCoin] || { price: 0, change: 0 };
        setPrice(data.price);
        setPriceChange(data.change);
        
        // Simulate fetching additional coin data
        setCoinData({
          name: selectedCoin,
          fullName: getFullName(selectedCoin),
          marketCap: getMockMarketCap(selectedCoin),
          volume24h: getMockVolume(selectedCoin),
          circulatingSupply: getMockSupply(selectedCoin),
          description: getMockDescription(selectedCoin)
        });

        // Fetch historical price data based on timeframe
        const historicalData = await getMarketData(selectedCoin, timeframe);
        
        // Format data for the chart
        const labels = historicalData.map(point => {
          const date = new Date(point.timestamp);
          if (timeframe === "1h") return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          if (timeframe === "1d") return `${date.getHours()}:00`;
          if (timeframe === "1w") return `${date.getMonth()+1}/${date.getDate()}`;
          if (timeframe === "1m") return `${date.getMonth()+1}/${date.getDate()}`;
          return `${date.getMonth()+1}/${date.getDate()}`;
        });
        
        const prices = historicalData.map(point => point.price);
        
        setChartData({
          labels: labels,
          datasets: [{
            label: `${selectedCoin} Price`,
            data: prices,
            borderColor: 'rgba(56, 178, 172, 1)',
            backgroundColor: 'rgba(56, 178, 172, 0.1)',
          }]
        });
        
        setIsChartLoading(false);
      } catch (error) {
        console.error("Error fetching coin data:", error);
        setIsChartLoading(false);
      }
    };
    
    fetchCoinData();
  }, [selectedCoin, timeframe]);

  // Helper functions to generate mock data
  const getFullName = (symbol) => {
    const names = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'TON': 'Toncoin',
      'SOL': 'Solana',
      'TRX': 'TRON',
      'USDT': 'Tether',
      'USDC': 'USD Coin',
      'XRP': 'Ripple',
      'WBTC': 'Wrapped Bitcoin',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'DAI': 'Dai',
      'BTT': 'BitTorrent',
      'JST': 'JUST',
      'SUN': 'Sun Token',
      'WIN': 'WINkLink',
      'RAY': 'Raydium',
      'SRM': 'Serum',
      'BONK': 'Bonk',
      'JTO': 'Jito'
    };
    return names[symbol] || symbol;
  };

  const getMockMarketCap = (symbol) => {
    const caps = {
      'BTC': 1.15e12,
      'ETH': 390e9,
      'TON': 15e9,
      'SOL': 65e9,
      'TRX': 12e9,
      'USDT': 92e9,
      'USDC': 31e9,
      'XRP': 35e9
    };
    return caps[symbol] || 1e9;
  };

  const getMockVolume = (symbol) => {
    const volumes = {
      'BTC': 28e9,
      'ETH': 15e9,
      'TON': 500e6,
      'SOL': 2.5e9,
      'TRX': 800e6,
      'USDT': 45e9,
      'USDC': 3.2e9,
      'XRP': 1.8e9
    };
    return volumes[symbol] || 100e6;
  };

  const getMockSupply = (symbol) => {
    const supplies = {
      'BTC': 19.4e6,
      'ETH': 120e6,
      'TON': 2.8e9,
      'SOL': 458e6,
      'TRX': 90e9,
      'USDT': 92e9,
      'USDC': 31e9,
      'XRP': 45e9
    };
    return supplies[symbol] || 100e6;
  };

  const getMockDescription = (symbol) => {
    const descriptions = {
      'BTC': 'Bitcoin is the first decentralized cryptocurrency, released as open-source software in 2009.',
      'ETH': 'Ethereum is a decentralized, open-source blockchain with smart contract functionality.',
      'TON': 'The Open Network (TON) is a blockchain-based network initially developed by Telegram.',
      'SOL': 'Solana is a high-performance blockchain supporting smart contracts and decentralized applications.',
      'TRX': 'TRON is a blockchain-based operating system that aims to ensure free content entertainment system.',
      'USDT': 'Tether is a stablecoin pegged to the US dollar, maintaining a 1-to-1 value ratio.',
      'USDC': 'USD Coin is a stablecoin pegged to the US dollar, operated by Circle and Coinbase.',
      'XRP': 'XRP is the native cryptocurrency of the XRP Ledger, used for facilitating cross-border payments.'
    };
    return descriptions[symbol] || `${symbol} is a digital asset traded on cryptocurrency exchanges.`;
  };

  // Format market cap, volume, etc.
  const formatLargeNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
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
      <VStack spacing={6} align="stretch" maxW="container.sm" mx="auto" p={4}>
        <HStack justify="space-between" w="full" py={2}>
          <IconButton
            icon={<ArrowBackIcon />}
            variant="ghost"
            colorScheme="blue"
            onClick={onBack}
          />
          <Text fontSize="lg" fontWeight="bold" color="white">
            {coinData ? `${coinData.name} - ${coinData.fullName}` : selectedCoin}
          </Text>
          <IconButton
            icon={<InfoIcon />}
            variant="ghost"
            colorScheme="blue"
          />
        </HStack>

        <Box
          bg="gray.800"
          p={6}
          borderRadius="xl"
          mb={4}
        >
          <VStack spacing={4} align="start">
            <HStack w="full" justify="space-between">
              <HStack>
                <Box bg="blue.500" p={2} borderRadius="full">
                  <Image 
                    src={`/assets/coins/${selectedCoin ? selectedCoin.toLowerCase().split('-')[0] : 'generic'}.svg`}
                    boxSize="32px"
                    fallbackSrc="/assets/coins/generic.svg"
                  />
                </Box>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {selectedCoin}
                </Text>
              </HStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  ${price ? price.toFixed(2) : '0.00'}
                </Text>
                <Text 
                  fontSize="sm" 
                  color={priceChange >= 0 ? "green.400" : "red.400"}
                >
                  {priceChange >= 0 ? '+' : ''}{priceChange ? priceChange.toFixed(2) : '0.00'}%
                </Text>
              </VStack>
            </HStack>

            <Box w="full" h="200px" position="relative">
              {chartData && !isChartLoading ? (
                <PriceChart chartData={chartData} timeframe={timeframe} totalValue={price} />
              ) : (
                <Text 
                  position="absolute" 
                  top="50%" 
                  left="50%" 
                  transform="translate(-50%, -50%)" 
                  color="gray.500"
                  fontSize="sm"
                >
                  {isChartLoading ? "Loading chart data..." : "Failed to load chart"}
                </Text>
              )}
            </Box>

            <HStack w="full" spacing={2} justify="center">
              {['1h', '1d', '1w', '1m', '1y'].map((time) => (
                <Button
                  key={time}
                  size="sm"
                  variant={timeframe === time ? "solid" : "outline"}
                  colorScheme="blue"
                  onClick={() => {
                    setTimeframe(time);
                    setIsChartLoading(true);
                  }}
                >
                  {time.toUpperCase()}
                </Button>
              ))}
            </HStack>
          </VStack>
        </Box>

        <SimpleGrid columns={2} spacing={4}>
          <Button
            leftIcon={<ArrowUpIcon />}
            colorScheme="blue"
            size="lg"
            borderRadius="xl"
            onClick={() => {
              // Store selected coin and set proper navigation flags
              window.localStorage.setItem('selectedCoinForAction', selectedCoin);
              window.localStorage.setItem('previousScreen', 'cryptoDetail');
              
              // Dispatch event to show Send screen
              const event = new CustomEvent('showSendScreen', { 
                detail: { 
                  coin: selectedCoin,
                  returnPath: 'cryptoDetail'
                } 
              });
              window.dispatchEvent(event);
              onBack(); // Close details view
            }}
          >
            Send
          </Button>
          <Button
            leftIcon={<ArrowDownIcon />}
            colorScheme="blue"
            size="lg"
            borderRadius="xl"
            onClick={() => {
              // Store selected coin and set proper navigation flags
              window.localStorage.setItem('selectedCoinForAction', selectedCoin);
              window.localStorage.setItem('previousScreen', 'cryptoDetail');
              
              // Dispatch event to show Receive screen
              const event = new CustomEvent('showReceiveScreen', { 
                detail: { 
                  coin: selectedCoin,
                  returnPath: 'cryptoDetail'
                } 
              });
              window.dispatchEvent(event);
              onBack(); // Close details view
            }}
          >
            Receive
          </Button>
          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="blue"
            size="lg"
            borderRadius="xl"
            onClick={() => {
              // Store selected coin and set proper navigation flags
              window.localStorage.setItem('selectedCoinForAction', selectedCoin);
              window.localStorage.setItem('previousScreen', 'cryptoDetail');
              
              // Dispatch event to show Swap screen
              const event = new CustomEvent('showSwapScreen', { 
                detail: { 
                  coin: selectedCoin,
                  returnPath: 'cryptoDetail'
                } 
              });
              window.dispatchEvent(event);
              onBack(); // Close details view
            }}
          >
            Swap
          </Button>
          <Button
            colorScheme="blue"
            size="lg"
            borderRadius="xl"
            variant="outline"
            onClick={() => {
              // Store selected coin and set proper navigation flags
              window.localStorage.setItem('selectedCoinForAction', selectedCoin);
              window.localStorage.setItem('previousScreen', 'cryptoDetail');
              
              // Dispatch event to show BuySell screen
              const event = new CustomEvent('showBuySellScreen', { 
                detail: { 
                  coin: selectedCoin,
                  returnPath: 'cryptoDetail'
                } 
              });
              window.dispatchEvent(event);
              onBack(); // Close details view
            }}
          >
            Buy
          </Button>
        </SimpleGrid>

        <Box
          bg="gray.800"
          p={6}
          borderRadius="xl"
          mb={4}
        >
          <Text fontSize="lg" fontWeight="bold" color="white" mb={4}>
            Market Stats
          </Text>
          <VStack spacing={4} align="start">
            <HStack w="full" justify="space-between">
              <Text color="gray.400">Market Cap</Text>
              <Text color="white">{coinData ? formatLargeNumber(coinData.marketCap) : 'Loading...'}</Text>
            </HStack>
            <Divider borderColor="gray.700" />
            <HStack w="full" justify="space-between">
              <Text color="gray.400">Volume (24h)</Text>
              <Text color="white">{coinData ? formatLargeNumber(coinData.volume24h) : 'Loading...'}</Text>
            </HStack>
            <Divider borderColor="gray.700" />
            <HStack w="full" justify="space-between">
              <Text color="gray.400">Circulating Supply</Text>
              <Text color="white">
                {coinData && coinData.circulatingSupply ? 
                  `${(coinData.circulatingSupply / 1e6).toFixed(2)}M ${coinData.name}` : 
                  'Loading...'}
              </Text>
            </HStack>
          </VStack>
        </Box>

        <Box
          bg="gray.800"
          p={6}
          borderRadius="xl"
          mb={4}
        >
          <Text fontSize="lg" fontWeight="bold" color="white" mb={4}>
            About {coinData ? coinData.fullName : selectedCoin}
          </Text>
          <Text color="gray.400">
            {coinData ? coinData.description : 'Loading information...'}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default CryptoDetail;
