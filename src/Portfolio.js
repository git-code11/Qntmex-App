import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Select, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Grid, GridItem, Table, Thead, Tbody, Tr, Th, Td, IconButton, useToast, Spinner, Image } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import PriceChart from './PriceChart';
import { getCoinData } from './api';
import { getBalance } from './services/alchemyService';

export default function Portfolio({ onClose }) {
  const [timeframe, setTimeframe] = useState('24h');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [totalChange, setTotalChange] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const toast = useToast();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const fetchPortfolioData = async () => {
      try {
        // Get the user's wallet address from localStorage
        const { user } = require('./AuthContext').useAuth();
        let wallet = JSON.parse(localStorage.getItem(`wallet_${user.uid}`));
        const address = wallet ? wallet.address : '0x0000000000000000000000000000000000000000';
        
        // Get real ETH balance from Alchemy
        const alchemyService = require('./services/alchemyService');
        const ethBalance = await alchemyService.getBalance(address);
        const ethData = await getCoinData('ETH');
        const ethValue = parseFloat(ethBalance) * ethData.price;
        
        const ethAsset = {
          coin: 'ETH',
          balance: parseFloat(ethBalance),
          value: ethValue,
          price: ethData.price,
          change24h: ethData.priceChange24h || 0,
          high24h: ethData.high24h || 0,
          low24h: ethData.low24h || 0,
          isMock: false
        };
        
        // Get token balances
        const tokenBalances = await alchemyService.getTokenBalances(address);
        
        // Get token prices
        let tokenPrices = {};
        try {
          console.log("Getting token prices from Alchemy service");
          tokenPrices = await alchemyService.getTokenPrices();
          console.log("Token prices retrieved:", tokenPrices);
        } catch (error) {
          console.error("Error fetching token prices:", error);
          // Fallback to demo data
          tokenPrices = {
            'USDT': 1.0,
            'USDC': 1.0,
            'WBTC': 61000,
            'LINK': 15,
            'UNI': 8,
            'DAI': 1.0
          };
        }
        
        // Make sure we have a price for each token
        Object.keys(tokenBalances).forEach(token => {
          if (!tokenPrices[token]) {
            console.log(`No price found for ${token}, using fallback price`);
            // Set fallback prices for tokens without prices
            if (token === 'USDT' || token === 'USDC' || token === 'DAI') {
              tokenPrices[token] = 1.0;
            } else if (token === 'WBTC') {
              tokenPrices[token] = 61000;
            } else {
              tokenPrices[token] = 10.0; // Default fallback price
            }
          }
        });
        
        // Create asset objects for each token
        const tokenAssets = Object.entries(tokenBalances).map(([coin, balance]) => {
          const price = tokenPrices[coin] || 0;
          return {
            coin,
            balance,
            price,
            value: balance * price,
            change24h: 0, // We don't have this data from the API
            high24h: price * 1.05, // Estimate
            low24h: price * 0.95,  // Estimate
            isMock: false
          };
        });

        // For other networks' coins, we'll use demo data
        // In a real app, you'd fetch these from their respective networks
        let otherAssetsDemo = [];
        
        // Only add demo assets if we're not on ETH network
        if (localStorage.getItem('selectedNetwork') !== 'ETH') {
          otherAssetsDemo = [
            { coin: 'BTC', balance: 0.05, change24h: 2.4, isMock: true },
            { coin: 'TON', balance: 100, change24h: 3.1, isMock: true },
            { coin: 'TRX', balance: 500, change24h: 0.5, isMock: true },
            { coin: 'SOL', balance: 1, change24h: 4.2, isMock: true },
            { coin: 'XRP', balance: 100, change24h: -1.3, isMock: true },
            { coin: 'USDT', balance: 100, change24h: 0, isMock: true },
            { coin: 'USDC', balance: 100, change24h: 0, isMock: true },
          ];
        }
        
        // Get prices for demo assets and calculate values
        const demoAssetsWithPrices = await Promise.all(otherAssetsDemo.map(async (asset) => {
          try {
            const data = await getCoinData(asset.coin);
            return {
              ...asset,
              price: data.price,
              value: asset.balance * data.price,
              high24h: data.high24h || 0,
              low24h: data.low24h || 0
            };
          } catch (error) {
            console.error(`Error fetching ${asset.coin} data:`, error);
            return {
              ...asset,
              price: 0,
              value: 0,
              high24h: 0,
              low24h: 0
            };
          }
        }));
        
        // Combine ETH asset with token assets (if on ETH network) and other demo assets
        const assetsWithPrices = [
          ethAsset,
          ...(localStorage.getItem('selectedNetwork') === 'ETH' ? tokenAssets : []),
          ...demoAssetsWithPrices
        ];

        const holdingsData = [ethAsset, ...assetsWithPrices];
        let totalValue = 0;
        let totalPrevValue = 0;

        holdingsData.forEach(holding => {
          totalValue += holding.value;
          totalPrevValue += holding.value / (1 + holding.change24h / 100);
        })

        const portfolioChangePercent = totalPrevValue > 0 ? ((totalValue - totalPrevValue) / totalPrevValue) * 100 : 0;
        setPortfolioValue(totalValue);
        setHoldings(holdingsData);
        setTotalChange(portfolioChangePercent);
        await fetchHistoricalData(timeframe);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setError('Failed to load portfolio data. Please try again.');
        setIsLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to load portfolio data. Using cached data if available.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchPortfolioData();
  }, [timeframe]);

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
    fetchHistoricalData(e.target.value);
  };

  const fetchHistoricalData = async (period) => {
    // This would be replaced with actual historical data API call
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;

    // Generate mock historical data for visualization
    // In production, this would fetch from an API
    const now = Date.now();
    const points = days === 1 ? 24 : days;
    const interval = (days * 24 * 60 * 60 * 1000) / points;

    // Create a more realistic trend based on current portfolio value
    const baseValue = portfolioValue;
    const volatility = 0.03; // 3% volatility

    const dataPoints = Array(points).fill(0).map((_, i) => {
      const timestamp = now - (points - i) * interval;
      // Random walk with trend
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const trendFactor = 1 + randomChange;
      const value = baseValue * (0.9 + (i / points) * 0.2) * trendFactor;

      return {
        date: new Date(timestamp),
        value: value
      };
    });

    // Format as needed for the chart component
    const formattedData = {
      labels: dataPoints.map(point => point.date.toLocaleTimeString()),
      datasets: [
        {
          label: 'Portfolio Value',
          data: dataPoints.map(point => point.value),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };

    setChartData(formattedData);
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="gray.900"
      zIndex="modal"
      overflowY="auto"
      p={4}
    >
      <VStack spacing={6} align="stretch" maxW="container.sm" mx="auto">
        <HStack justify="space-between">
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            onClick={onClose}
            variant="ghost"
            color="gray.400"
          />
          <Text fontSize="xl" fontWeight="bold" color="white">
            Portfolio
          </Text>
          <Box w="40px"></Box>
        </HStack>

        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem w='100%' bg="gray.800" p={4} borderRadius="lg">
            <Stat>
              <StatLabel color="gray.400">Total Value</StatLabel>
              <StatNumber color="white" fontSize="3xl">${portfolioValue.toFixed(2)}</StatNumber>
              <StatHelpText>
                <StatArrow type={totalChange >= 0 ? 'increase' : 'decrease'} />
                {totalChange.toFixed(2)}%
              </StatHelpText>
            </Stat>
          </GridItem>
          <GridItem w='100%' bg="gray.800" p={4} borderRadius="lg">
            <Stat>
              <StatLabel color="gray.400">Assets</StatLabel>
              <StatNumber color="white" fontSize="3xl">{holdings.length}</StatNumber>
              <StatHelpText color="gray.400">
                Active positions
              </StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        <HStack w="100%" justify="flex-end" mb={2}>
          <Select
            value={timeframe}
            onChange={handleTimeframeChange}
            size="sm"
            width="100px"
            bg="gray.800"
            color="white"
            borderColor="gray.700"
          >
            <option value="24h">24h</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </Select>
        </HStack>

        <Box w="100%" h="300px" bg="gray.800" borderRadius="lg" p={4}>
          {!isLoading && chartData && (
            <PriceChart
              timeframe={timeframe}
              chartData={chartData}
              totalValue={portfolioValue}
            />
          )}
          {isLoading && (
            <VStack justify="center" h="100%">
              <Spinner color="blue.400" size="xl" />
              <Text color="gray.400" mt={4}>Loading portfolio data...</Text>
            </VStack>
          )}
          {error && !isLoading && (
            <VStack justify="center" h="100%">
              <Text color="red.400">{error}</Text>
            </VStack>
          )}
        </Box>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color="gray.400" borderColor="gray.700">ASSET</Th>
                <Th color="gray.400" borderColor="gray.700">AMOUNT</Th>
                <Th color="gray.400" borderColor="gray.700">VALUE</Th>
                <Th color="gray.400" borderColor="gray.700">24H CHANGE</Th>
              </Tr>
            </Thead>
            <Tbody>
              {holdings.map((holding) => (
                <Tr key={holding.coin}>
                  <Td borderColor="gray.700" color="white">
                    <HStack>
                      <Text>{holding.coin}</Text>
                      {holding.isMock && <Text color="orange.400" fontSize="xs">(Demo)</Text>}
                    </HStack>
                  </Td>
                  <Td borderColor="gray.700" color="white">
                    {(holding.balance || 0).toLocaleString(undefined, { maximumFractionDigits: holding.coin === 'ETH' ? 4 : 2 })}
                  </Td>
                  <Td borderColor="gray.700" color="white">
                    ${(holding.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Td>
                  <Td borderColor="gray.700" color={holding.change24h >= 0 ? "green.400" : "red.400"}>
                    {(holding.change24h || 0).toFixed(2)}%
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
}