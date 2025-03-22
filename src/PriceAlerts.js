import { useState, useEffect } from "react";
import { Box, VStack, Text, IconButton, HStack, Input, Button, Select, FormControl, FormLabel, useColorMode, Divider, Badge, Switch, FormHelperText, useToast, Flex, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tooltip } from "@chakra-ui/react";
import { ArrowBackIcon, DeleteIcon, InfoIcon, BellIcon, CheckIcon } from "@chakra-ui/icons";
import { getCoinData } from "./api";

const PriceAlerts = ({ onClose }) => {
  const [alerts, setAlerts] = useState(JSON.parse(localStorage.getItem('priceAlerts') || '[]'));
  const [coin, setCoin] = useState('BTC');
  const [type, setType] = useState('above');
  const [price, setPrice] = useState('');
  const [currentPrices, setCurrentPrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [repeatNotification, setRepeatNotification] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [percentValue, setPercentValue] = useState(5);
  const toast = useToast();

  // Fetch current prices on component mount
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      const prices = {};
      const coinList = ['BTC', 'ETH', 'TON', 'SOL', 'TRX', 'XRP', 'USDT', 'USDC'];

      for (const c of coinList) {
        try {
          const data = await getCoinData(c);
          if (data && data.price) {
            prices[c] = data.price;
          }
        } catch (error) {
          console.error(`Error fetching price for ${c}:`, error);
        }
      }

      setCurrentPrices(prices);
      setIsLoadingPrices(false);
    };

    fetchPrices();

    // Set up check interval for alerts
    const intervalId = setInterval(() => {
      checkAlerts();
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  // Update price based on selected coin and percentage
  useEffect(() => {
    if (currentPrices[coin]) {
      const basePrice = currentPrices[coin];
      const modifier = type === 'above' ? 1 + (percentValue / 100) : 1 - (percentValue / 100);
      setPrice((basePrice * modifier).toFixed(2));
    }
  }, [coin, type, percentValue, currentPrices]);

  const checkAlerts = async () => {
    if (alerts.length === 0) return;

    // Get latest prices
    const alertedCoins = [...new Set(alerts.map(alert => alert.coin))];
    const latestPrices = {};

    for (const c of alertedCoins) {
      try {
        const data = await getCoinData(c);
        if (data && data.price) {
          latestPrices[c] = data.price;
        }
      } catch (error) {
        console.error(`Error fetching price for ${c}:`, error);
      }
    }

    // Check each alert
    const triggeredAlerts = [];
    const updatedAlerts = alerts.map(alert => {
      // Skip already triggered non-repeating alerts
      if (alert.triggered && !alert.repeat) return alert;

      const currentPrice = latestPrices[alert.coin];
      if (!currentPrice) return alert;

      const shouldTrigger = 
        (alert.type === 'above' && currentPrice >= alert.price) ||
        (alert.type === 'below' && currentPrice <= alert.price);

      if (shouldTrigger && (!alert.triggered || alert.repeat)) {
        triggeredAlerts.push({
          ...alert,
          currentPrice
        });
        return { ...alert, triggered: true, lastTriggered: new Date().toISOString() };
      }

      return alert;
    });

    // Display notifications for triggered alerts
    triggeredAlerts.forEach(alert => {
      const title = `${alert.coin} Price Alert`;
      const description = `${alert.coin} is now ${alert.type === 'above' ? 'above' : 'below'} $${alert.price} (Current: $${alert.currentPrice.toFixed(2)})`;

      toast({
        title,
        description,
        status: 'info',
        duration: 9000,
        isClosable: true,
        position: 'top',
        icon: <BellIcon />,
      });
    });

    // Update alerts in state and localStorage
    if (triggeredAlerts.length > 0) {
      setAlerts(updatedAlerts);
      localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    }
  };

  const handleAddAlert = () => {
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price value",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newAlert = {
      id: Date.now(),
      coin,
      type,
      price: parseFloat(price),
      createdAt: new Date().toISOString(),
      repeat: repeatNotification,
      triggered: false
    };

    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    setPrice('');
    setRepeatNotification(false);

    toast({
      title: "Alert Created",
      description: `You'll be notified when ${coin} goes ${type} $${parseFloat(price).toLocaleString()}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteAlert = (id) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));

    toast({
      title: "Alert Deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const getStatusColor = (alert) => {
    if (alert.triggered) {
      return "green.400";
    }
    return alert.type === 'above' ? "orange.400" : "blue.400";
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
            onClick={onClose}
          />
          <Text fontSize="lg" fontWeight="bold" color="white">
            Price Alerts
          </Text>
          <IconButton
            icon={<InfoIcon />}
            variant="ghost"
            colorScheme="blue"
            onClick={() => {
              toast({
                title: "About Price Alerts",
                description: "Set alerts to be notified when a cryptocurrency reaches a specific price threshold. Alerts are checked approximately every minute when the app is open.",
                status: "info",
                duration: 5000,
                isClosable: true,
              });
            }}
          />
        </HStack>

        <Box bg="gray.800" p={6} borderRadius="xl">
          <Text color="white" fontSize="lg" fontWeight="bold" mb={4}>
            Create New Alert
          </Text>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="gray.400">Coin</FormLabel>
              <Select 
                bg="gray.700" 
                color="white"
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="TON">Toncoin (TON)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="TRX">TRON (TRX)</option>
                <option value="XRP">Ripple (XRP)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="USDC">USD Coin (USDC)</option>
              </Select>
              {currentPrices[coin] && (
                <FormHelperText color="blue.300">
                  Current price: ${currentPrices[coin].toLocaleString()}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl>
              <FormLabel color="gray.400">Alert Type</FormLabel>
              <Select 
                bg="gray.700" 
                color="white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.400">Set Target (% {type === 'above' ? 'Higher' : 'Lower'})</FormLabel>
              <Slider
                min={1}
                max={50}
                step={1}
                value={percentValue}
                onChange={(v) => setPercentValue(v)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                mb={3}
              >
                <SliderTrack bg="gray.700">
                  <SliderFilledTrack bg="blue.500" />
                </SliderTrack>
                <Tooltip
                  hasArrow
                  bg="blue.500"
                  color="white"
                  placement="top"
                  isOpen={showTooltip}
                  label={`${percentValue}%`}
                >
                  <SliderThumb boxSize={6}>
                    <Box color="blue.500" />
                  </SliderThumb>
                </Tooltip>
              </Slider>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.400">Target Price (USD)</FormLabel>
              <Input 
                bg="gray.700" 
                color="white" 
                placeholder="Enter price..." 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="0.01"
              />
              <FormHelperText color={type === 'above' ? "green.300" : "red.300"}>
                {type === 'above' 
                  ? `Alert when ${percentValue}% above current price`
                  : `Alert when ${percentValue}% below current price`}
              </FormHelperText>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="repeat-alert" mb="0" color="gray.400">
                Repeat Notification
              </FormLabel>
              <Switch 
                id="repeat-alert" 
                colorScheme="blue" 
                isChecked={repeatNotification} 
                onChange={(e) => setRepeatNotification(e.target.checked)} 
              />
            </FormControl>

            <Button 
              colorScheme="blue" 
              width="full" 
              mt={2}
              onClick={handleAddAlert}
              isLoading={isLoadingPrices}
            >
              Create Alert
            </Button>
          </VStack>
        </Box>

        <Box bg="gray.800" p={6} borderRadius="xl" mb={10}>
          <Text color="white" fontSize="lg" fontWeight="bold" mb={4}>
            Your Alerts
          </Text>

          {alerts.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              No alerts set. Create one above.
            </Text>
          ) : (
            <VStack spacing={3} align="stretch">
              {alerts.map((alert) => (
                <Box key={alert.id} p={3} bg="gray.700" borderRadius="lg">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Text color="white" fontWeight="bold">{alert.coin}</Text>
                        <Badge colorScheme={alert.type === 'above' ? 'green' : 'red'}>
                          {alert.type === 'above' ? 'Above' : 'Below'}
                        </Badge>
                        {alert.triggered && (
                          <Badge colorScheme="green">
                            <HStack spacing={1}>
                              <CheckIcon boxSize={2} />
                              <Text>Triggered</Text>
                            </HStack>
                          </Badge>
                        )}
                        {alert.repeat && <Badge colorScheme="purple">Repeating</Badge>}
                      </HStack>
                      <Text color={getStatusColor(alert)} fontSize="xl">${alert.price.toLocaleString()}</Text>
                      {alert.triggered && alert.lastTriggered && (
                        <Text color="gray.400" fontSize="xs">
                          Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                        </Text>
                      )}
                    </VStack>
                    <IconButton
                      icon={<DeleteIcon />}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default PriceAlerts;