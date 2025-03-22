import { Box, VStack, Text, Button, IconButton, HStack, Menu, MenuButton, MenuItem, MenuList, SimpleGrid, Image, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon, ChevronDownIcon, SettingsIcon, ArrowUpIcon, ArrowDownIcon, RepeatIcon, StarIcon, TimeIcon, ExternalLinkIcon, ViewIcon, BellIcon, InfoIcon } from "@chakra-ui/icons";
import PriceAlerts from './PriceAlerts';
import { DollarSign, FileText } from "react-feather";
import EthTester from './EthTester';
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { BrowserRouter as Router } from 'react-router-dom';
import SplashScreen from "./SplashScreen";
import Register from "./Register";
import Login from "./Login";
import Send from "./Send";
import CryptoDetail from "./CryptoDetail";
import Receive from "./Receive";
import Swap from "./Swap";
import TransactionHistory from "./TransactionHistory";
import Settings from "./Settings";
import Browser from "./Browser";
import Collectibles from "./Collectibles";
import BuySell from "./BuySell";
import Portfolio from "./Portfolio";
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { getCoinData } from './api';
import { createWallet, getBalance, getTokenBalances, getTokenPrices } from './services/alchemyService';
import { logConfigStatus } from './utils/debug';
import ErrorBoundary from './components/ErrorBoundary.js'; // Corrected import path

// Log configuration status on app load
logConfigStatus();

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

async function testCoinGeckoAPI() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin', { // Example API call
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error testing CoinGecko API:', error);
    return null;
  }
}


function App() {
  const { user, logout, loading } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState('ETH');
  // Default to splash screen until auth is initialized
  const [showSplash, setShowSplash] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Initialize UI state based on auth status and localStorage flags
  useEffect(() => {
    // Don't update UI state until auth is initialized
    if (loading) {
      return;
    }

    console.log("App state transition - Auth state:", !!user, "User:", user?.uid);

    // Check flags and auth state to determine which screen to show
    const showLoginFlag = localStorage.getItem('showLogin') === 'true';
    const showSplashFlag = localStorage.getItem('showSplash') === 'true';

    // Reset all UI states first to prevent flashing
    const resetAllStates = () => {
      setShowLogin(false);
      setShowSplash(false);
      setShowRegister(false);
    };

    // CRITICAL: User authentication status has ABSOLUTE priority
    // If we have a user, ALWAYS show the dashboard no matter what
    if (user) {
      // User is logged in, show main app regardless of flags
      console.log("User authenticated, showing dashboard - UID:", user.uid);
      resetAllStates();
      // ENSURE we clear ALL navigation flags when user is authenticated
      localStorage.removeItem('showLogin');
      localStorage.removeItem('showSplash');
    } else if (showLoginFlag) {
      // No authenticated user, but login flag is set
      console.log("No user, but login flag set - showing login screen");
      resetAllStates();
      setShowLogin(true);
      localStorage.removeItem('showSplash');
    } else if (showSplashFlag) {
      // No user, no login flag, but splash flag is set
      console.log("No user, splash flag set - showing splash screen");
      resetAllStates();
      setShowSplash(true);
    } else {
      // Default fallback - show splash screen
      console.log("No user, no flags - defaulting to splash");
      resetAllStates();
      setShowSplash(true);
      localStorage.setItem('showSplash', 'true');
    }
  }, [user, loading]);
  const [showSend, setShowSend] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showCryptoDetail, setShowCryptoDetail] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showCollectibles, setShowCollectibles] = useState(false);
  const [showBuySell, setShowBuySell] = useState(false);
  const [showPriceAlerts, setShowPriceAlerts] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showEthTester, setShowEthTester] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  // Track if we should skip returning to crypto details
  const [skipCryptoDetails, setSkipCryptoDetails] = useState(false);
  const [coinPrices, setCoinPrices] = useState({});
  const [walletAddress, setWalletAddress] = useState("0x...");
  const [walletBalances, setWalletBalances] = useState({});

  useEffect(() => {
    const fetchAllPrices = async () => {
      const coins = ['BTC', 'ETH', 'TON', 'TRX', 'SOL', 'XRP', 'USDT', 'USDC'];
      const newPrices = {...coinPrices}; // Start with existing prices to preserve them if fetch fails

      // Default fallback prices in case API completely fails
      const fallbackPrices = {
        'BTC': 60000 + Math.random() * 2000,
        'ETH': 3300 + Math.random() * 100,
        'TON': 5.5 + Math.random() * 0.5,
        'TRX': 0.12 + Math.random() * 0.01,
        'SOL': 100 + Math.random() * 5,
        'XRP': 0.5 + Math.random() * 0.1,
        'USDT': 0.99 + Math.random() * 0.02,
        'USDC': 0.99 + Math.random() * 0.02,
      };

      for (const coin of coins) {
        try {
          const data = await getCoinData(coin);
          if (data && typeof data.price === 'number') {
            newPrices[coin] = data.price;
            console.log(`Updated ${coin} price: $${data.price.toFixed(2)}${data.isMockData ? ' (mock)' : ''}`);
          } else {
            // If data is invalid, use fallback price
            newPrices[coin] = fallbackPrices[coin] || 0;
            console.log(`Using fallback price for ${coin}: $${newPrices[coin].toFixed(2)} (mock)`);
          }
        } catch (error) {
          console.error(`Error fetching ${coin} price:`, error);
          // Use fallback price on error
          newPrices[coin] = fallbackPrices[coin] || 0;
          console.log(`Using fallback price for ${coin}: $${newPrices[coin].toFixed(2)} (mock)`);
        }
      }

      setCoinPrices(newPrices);
    };

    // Initial fetch
    fetchAllPrices();

    // Set up interval for periodic updates
    const interval = setInterval(fetchAllPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Load wallet data when user is logged in or network changes
  useEffect(() => {
    if (user) {
      const loadWalletData = async () => {
        try {
          // For demo purposes, either load from localStorage or create a new wallet
          let wallet = localStorage.getItem(`wallet_${user.uid}`);

          if (!wallet) {
            // If no wallet exists for this user, create one
            try {
              // Use imported service to create wallet
              console.log("Creating new wallet with alchemyService");
              const newWallet = await createWallet();
              localStorage.setItem(`wallet_${user.uid}`, JSON.stringify(newWallet));
              wallet = newWallet;
            } catch (e) {
              console.error("Failed to create wallet:", e);
              // Use ethers directly as fallback
              console.log("Using fallback wallet creation method");
              const fallbackWallet = ethers.Wallet.createRandom();
              const newWallet = {
                address: fallbackWallet.address,
                privateKey: fallbackWallet.privateKey,
                mnemonic: fallbackWallet.mnemonic.phrase
              };
              localStorage.setItem(`wallet_${user.uid}`, JSON.stringify(newWallet));
              wallet = newWallet;
            }
          } else {
            try {
              wallet = JSON.parse(wallet);
            } catch (parseError) {
              console.error("Error parsing wallet data:", parseError);
              // Create a new wallet if parsing fails
              const fallbackWallet = ethers.Wallet.createRandom();
              wallet = {
                address: fallbackWallet.address,
                privateKey: fallbackWallet.privateKey,
                mnemonic: fallbackWallet.mnemonic.phrase
              };
              localStorage.setItem(`wallet_${user.uid}`, JSON.stringify(wallet));
            }
          }

          console.log("Wallet loaded successfully:", wallet.address);
          setWalletAddress(wallet.address);

          // Set up network-specific balances
          let balances = {};

          if (selectedNetwork === 'ETH') {
            try {
              // For ETH network, fetch actual ETH balance from Alchemy
              console.log("Getting ETH balance from Alchemy service");
              const ethBalance = await getBalance(wallet.address);
              console.log("ETH balance retrieved:", ethBalance);

              // Initialize balances with ETH (default to 0 if no balance)
              balances = {
                'ETH': parseFloat(ethBalance) || 0,
              };

              // Get token balances
              console.log("Getting token balances from Alchemy service");
              const tokenBalances = await getTokenBalances(wallet.address);

              // Include all tokens regardless of balance
              const allTokenBalances = {};
              if (tokenBalances && typeof tokenBalances === 'object') {
                Object.entries(tokenBalances).forEach(([token, balance]) => {
                  allTokenBalances[token] = balance;
                });
              }

              // Merge ETH balance with all token balances
              balances = {
                ...balances,
                ...allTokenBalances
              };

              console.log("Token balances retrieved:", allTokenBalances);

              // Update token prices in coinPrices state
              try {
                console.log("Getting token prices from Alchemy service");
                const tokenPrices = await getTokenPrices();
                console.log("Token prices retrieved:", tokenPrices);

                if (tokenPrices && typeof tokenPrices === 'object') {
                  // Update coinPrices state with token prices
                  Object.entries(tokenPrices).forEach(([token, price]) => {
                    if (price && !isNaN(price)) {
                      console.log(`Updated ${token} price: $${price.toFixed(2)}`);
                    }
                  });

                  setCoinPrices(prev => ({
                    ...prev,
                    ...tokenPrices
                  }));
                }
              } catch (priceError) {
                console.error("Failed to get token prices:", priceError);
                // Even on error, let's try to update with fallback prices for better UX
                const fallbackPrices = {
                  'USDT': 1.0,
                  'USDC': 1.0,
                  'WBTC': 61000,
                  'LINK': 15,
                  'UNI': 8,
                  'DAI': 1.0
                };

                setCoinPrices(prev => ({
                  ...prev,
                  ...fallbackPrices
                }));
              }

            } catch (e) {
              console.error("Failed to get ETH balance and tokens:", e);
              // Initialize ETH with zero balance
              balances = {
                'ETH': 0,
              };

              // Make sure ETH price is set even if there's an error
              setCoinPrices(prev => ({
                ...prev,
                'ETH': 3500
              }));
            }
          } else if (selectedNetwork === 'TRX') {
            // For TRON network, use demo data with zero balances as requested
            balances = {
              'TRX': 0,
              'BTT': 0,
              'JST': 0,
              'SUN': 0,
              'WIN': 0,
              'USDT-TRC20': 0,
            };
          } else if (selectedNetwork === 'SOL') {
            // For Solana network, use demo data with zero balances as requested
            balances = {
              'SOL': 0,
              'RAY': 0,
              'SRM': 0,
              'USDC-SPL': 0,
              'BONK': 0,
              'JTO': 0,
            };
          }

          setWalletBalances(balances);
        } catch (error) {
          console.error("Error loading wallet data:", error);
          // Set zero balances for all networks
          if (selectedNetwork === 'ETH') {
            setWalletBalances({
              'ETH': 0,
              'USDT': 0,
              'USDC': 0,
              'WBTC': 0,
              'LINK': 0,
              'UNI': 0,
              'DAI':.0,
            });
            // Make sure at least ETH price is available
            setCoinPrices(prev => ({
              ...prev,
              'ETH': prev.ETH || 3500
            }));
          } else if (selectedNetwork === 'TRX') {
            setWalletBalances({
              'TRX': 0,
              'BTT': 0,
              'JST': 0,
              'SUN': 0,
              'WIN': 0,
              'USDT-TRC20': 0,
            });
          } else if (selectedNetwork === 'SOL') {
            setWalletBalances({
              'SOL': 0,
              'RAY': 0,
              'SRM': 0,
              'USDC-SPL': 0,
              'BONK': 0,
              'JTO': 0,
            });
          }
        }
      };

      loadWalletData();
    }
  }, [user, selectedNetwork]);

  useEffect(() => {
    // Set up WebSocket listeners for each coin if you want to implement real-time updates later
    const coins = ['BTC', 'ETH', 'TON', 'TRX', 'SOL', 'XRP', 'USDT', 'USDC'];
    const listeners = {};

    coins.forEach(coin => {
      const listener = (event) => {
        setCoinPrices(prev => ({
          ...prev,
          [coin]: event.detail.price
        }));
      };
      window.addEventListener(`price_update_${coin}`, listener);
      listeners[coin] = listener;
    });

    // Add direct navigation event listeners
    const showSendListener = (event) => {
      // Check if we need to remember the skipCryptoDetails flag
      const skipDetails = window.localStorage.getItem('skipCryptoDetails') === 'true';
      setSkipCryptoDetails(skipDetails);
      
      setShowCryptoDetail(false);
      setShowSend(true);
      if (event.detail && event.detail.coin) {
        setSelectedCoin(event.detail.coin);
      }
    };

    const showReceiveListener = (event) => {
      // Check if we need to remember the skipCryptoDetails flag
      const skipDetails = window.localStorage.getItem('skipCryptoDetails') === 'true';
      setSkipCryptoDetails(skipDetails);
      
      setShowCryptoDetail(false);
      setShowReceive(true);
      if (event.detail && event.detail.coin) {
        setSelectedCoin(event.detail.coin);
      }
    };

    const showSwapListener = (event) => {
      // Check if we need to remember the skipCryptoDetails flag
      const skipDetails = window.localStorage.getItem('skipCryptoDetails') === 'true';
      setSkipCryptoDetails(skipDetails);
      
      setShowCryptoDetail(false);
      setShowSwap(true);
      if (event.detail && event.detail.coin) {
        setSelectedCoin(event.detail.coin);
      }
    };

    const showBuySellListener = (event) => {
      // Check if we need to remember the skipCryptoDetails flag
      const skipDetails = window.localStorage.getItem('skipCryptoDetails') === 'true';
      setSkipCryptoDetails(skipDetails);
      
      setShowCryptoDetail(false);
      setShowBuySell(true);
      if (event.detail && event.detail.coin) {
        setSelectedCoin(event.detail.coin);
      }
    };

    window.addEventListener('showSendScreen', showSendListener);
    window.addEventListener('showReceiveScreen', showReceiveListener);
    window.addEventListener('showSwapScreen', showSwapListener);
    window.addEventListener('showBuySellScreen', showBuySellListener);

    return () => {
      // Cleanup listeners
      Object.entries(listeners).forEach(([coin, listener]) => {
        window.removeEventListener(`price_update_${coin}`, listener);
      });
      window.removeEventListener('showSendScreen', showSendListener);
      window.removeEventListener('showReceiveScreen', showReceiveListener);
      window.removeEventListener('showSwapScreen', showSwapListener);
      window.removeEventListener('showBuySellScreen', showBuySellListener);
    };
  }, []);

  // We've already handled the user state changes in the effect hook above
  // showLogin is already defined above, so we don't need a duplicate definition

  // Show a loading spinner while auth is initializing
  if (loading) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.900" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing={3}>
          <Box 
            w="60px" 
            h="60px" 
            borderRadius="full" 
            border="3px solid" 
            borderColor="blue.400"
            borderBottomColor="transparent"
            animation="spin 1s linear infinite"
          />
          <Text color="blue.400" fontWeight="bold">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  // First check if we should show the login screen directly
  if (showLogin) {
    return (
      <Login 
        onBack={() => {
          setShowLogin(false);
          setShowSplash(true);
          localStorage.removeItem('showLogin');
          localStorage.setItem('showSplash', 'true');
        }} 
      />
    );
  }

  // Then check if we should show the splash screen
  if (showSplash) {
    return (
      <SplashScreen 
        onGetStarted={() => {
          setShowSplash(false);
          setShowRegister(true);
        }}
        onLogin={() => {
          setShowSplash(false);
          setShowLogin(true);
          localStorage.setItem('showLogin', 'true');
          localStorage.removeItem('showSplash');
        }}
      />
    );
  }

  if (showRegister) {
    return (
      <Register 
        onBack={() => {
          setShowRegister(false);
          setShowSplash(true);
        }} 
      />
    );
  }

  if (showLogin) {
    return (
      <Login 
        onBack={() => {
          setShowLogin(false);
          setShowSplash(true);
        }} 
      />
    );
  }

  // Modified logout function to show overlay
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      // Remove wallet data
      if (user) {
        localStorage.removeItem(`wallet_${user.uid}`);
      }

      // Set the login screen flag instead of splash screen
      localStorage.setItem('showLogin', 'true');
      localStorage.removeItem('showSplash');

      // Wait a moment to show the loading overlay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Perform logout
      await logout();

      // Force reload after successful logout
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" position="relative">
      {logoutLoading && (
        <Box 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          bg="rgba(0,0,0,0.7)" 
          zIndex="1500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          backdropFilter="blur(3px)"
        >
          <VStack spacing={3}>
            <Box 
              w="60px" 
              h="60px" 
              borderRadius="full" 
              border="3px solid" 
              borderColor="blue.400"
              borderBottomColor="transparent"
              animation="spin 1s linear infinite"
            />
            <Text color="blue.400" fontWeight="bold">Logging out...</Text>
          </VStack>
        </Box>
      )}
      <VStack spacing={6} align="stretch" maxW="container.sm" mx="auto" p={4}>
        <HStack justify="space-between" w="full" py={2}>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost" color="gray.400" bg="gray.800" _hover={{ bg: "gray.700" }}>
              {selectedNetwork} Network
            </MenuButton>
            <MenuList bg="gray.800" borderColor="gray.700">
              <MenuItem onClick={() => setSelectedNetwork('ETH')} bg="gray.800" _hover={{ bg: "gray.700" }} color="gray.100">
                ETH Network
              </MenuItem>
              <MenuItem onClick={() => setSelectedNetwork('TRX')} bg="gray.800" _hover={{ bg: "gray.700" }} color="gray.100">
                TRON Network
              </MenuItem>
              <MenuItem onClick={() => setSelectedNetwork('SOL')} bg="gray.800" _hover={{ bg: "gray.700" }} color="gray.100">
                Solana Network
              </MenuItem>
            </MenuList>
          </Menu>
          <IconButton
            icon={<SettingsIcon />}
            variant="ghost"
            color="gray.400"
            bg="gray.800"
            _hover={{ bg: "gray.700" }}
            onClick={() => setShowSettings(true)}
          />
        </HStack>

        <VStack spacing={2} align="center" py={8} cursor="pointer" onClick={() => setShowPortfolio(true)}>
          <Text fontSize="5xl" fontWeight="bold" color="white">
            ${Object.entries(coinPrices).reduce((total, [coin, price]) => {
              return total + (price * (walletBalances[coin] || 0));
            }, 0).toFixed(2)}
          </Text>
          <Text color="gray.400" fontSize="sm">Your address: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}</Text>
          <Text color="gray.400" fontSize="xs">Tap to view portfolio</Text>
        </VStack>

        <SimpleGrid columns={4} spacing={6} px={4}>
          <VStack spacing={2}>
            <IconButton
              icon={<ArrowUpIcon />}
              rounded="full"
              size="lg"
              variant="ghost"
              color="blue.400"
              _hover={{ bg: "gray.800" }}
              onClick={() => {
                const storedCoin = window.localStorage.getItem('selectedCoinForAction');
                if (storedCoin) {
                  setSelectedCoin(storedCoin);
                  window.localStorage.removeItem('selectedCoinForAction');
                }
                setShowSend(true);
              }}
              data-action="send"
            />
            <Text fontSize="sm" color="gray.400">Send</Text>
          </VStack>
          <VStack spacing={2}>
            <IconButton
              icon={<ArrowDownIcon />}
              rounded="full"
              size="lg"
              variant="ghost"
              color="blue.400"
              _hover={{ bg: "gray.800" }}
              onClick={() => {
                const storedCoin = window.localStorage.getItem('selectedCoinForAction');
                if (storedCoin) {
                  setSelectedCoin(storedCoin);
                  window.localStorage.removeItem('selectedCoinForAction');
                }
                setShowReceive(true);
              }}
              data-action="receive"
            />
            <Text fontSize="sm" color="gray.400">Receive</Text>
          </VStack>
          <VStack spacing={2}>
            <IconButton
              icon={<ViewIcon />}
              rounded="full"
              size="lg"
              variant="ghost"
              color="blue.400"
              _hover={{ bg: "gray.800" }}
            />
            <Text fontSize="sm" color="gray.400">Scan</Text>
          </VStack>
          <VStack spacing={2}>
            <IconButton
              icon={<RepeatIcon />}
              rounded="full"
              size="lg"
              variant="ghost"
              color="blue.400"
              _hover={{ bg: "gray.800" }}
              onClick={() => {
                const storedCoin = window.localStorage.getItem('selectedCoinForAction');
                if (storedCoin) {
                  setSelectedCoin(storedCoin);
                  window.localStorage.removeItem('selectedCoinForAction');
                }
                setShowSwap(true);
              }}
              data-action="swap"
            />
            <Text fontSize="sm" color="gray.400">Swap</Text>
          </VStack>
          <VStack spacing={2}>
            <IconButton
              icon={<DollarSign />}
              rounded="full"
              size="lg"
              variant="ghost"
              color="blue.400"
              _hover={{ bg: "gray.800" }}
              onClick={() => {
                const storedCoin = window.localStorage.getItem('selectedCoinForAction');
                if (storedCoin) {
                  setSelectedCoin(storedCoin);
                  window.localStorage.removeItem('selectedCoinForAction');
                }
                setShowBuySell(true);
              }}
              data-action="buysell"
            />
            <Text fontSize="sm" color="gray.400">Buy or sell</Text>
          </VStack>
          <VStack spacing={2}>
            <IconButton
              icon={<StarIcon />}
              rounded="full"
              size="lg"
              variant="ghost"
              color="blue.400"
              _hover={{ bg: "gray.800" }}
            />
            <Text fontSize="sm" color="gray.400">Stake</Text>
          </VStack>
          <VStack spacing={2}>
            <IconButton
              icon={<BellIcon />}
              rounded="full"
              size="lg"
              variant="ghost"
              color="blue.400"
              _hover={{ bg: "gray.800" }}
              onClick={() => setShowPriceAlerts(true)}
            />
            <Text fontSize="sm" color="gray.400">Alerts</Text>
          </VStack>
          <VStack spacing={2}>
            <IconButton
              icon={<FileText />}
              rounded="full"
              size="lg"
              variant="ghost"
              color="green.400"
              _hover={{ bg: "gray.800" }}
              onClick={() => setShowEthTester(true)}
            />
            <Text fontSize="sm" color="green.400">Test ETH</Text>
          </VStack>
        </SimpleGrid>

        <VStack spacing={2} align="stretch" mt={4}>
          {Object.keys(walletBalances).map((coin) => (
            <Box key={coin} p={4} bg="gray.800" borderRadius="xl" onClick={() => {setSelectedCoin(coin); setShowCryptoDetail(true);}}>
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Box bg="blue.500" p={2} borderRadius="full">
                    <Image 
                      src={`/assets/coins/${coin.toLowerCase().split('-')[0]}.svg`} 
                      boxSize="24px" 
                      fallbackSrc="/assets/coins/generic.svg" 
                    />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text color="white">{coin}</Text>
                    <Text color="gray.400" fontSize="sm">
                      ${(() => {
                        const baseCoin = coin.split('-')[0];
                        if (typeof coinPrices[baseCoin] === 'number') {
                          return coinPrices[baseCoin].toFixed(2);
                        } else if (baseCoin === 'USDT' || baseCoin === 'USDC' || baseCoin === 'DAI') {
                          return '1.00';
                        } else if (baseCoin === 'WBTC') {
                          return '61000.00';
                        } else {
                          return '0.00';
                        }
                      })()}
                    </Text>
                  </VStack>
                </HStack>
                <VStack align="end" spacing={0}>
                  <Text color="white">{walletBalances[coin] ? walletBalances[coin].toFixed(
                    coin === 'ETH' || coin === 'BTC' || coin === 'SOL' || coin === 'WBTC' ? 4 : 
                    coin === 'BONK' ? 0 : 2
                  ) : '0'}</Text>
                  <Text color="gray.400" fontSize="sm">
                    ${typeof coinPrices[coin.split('-')[0]] === 'number' && walletBalances[coin]
                      ? (coinPrices[coin.split('-')[0]] * walletBalances[coin]).toFixed(2)
                      : (walletBalances[coin] * (coin.includes('USDT') || coin.includes('USDC') || coin.includes('DAI') ? 1 : 0.1)).toFixed(2)}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
          <Button variant="ghost" colorScheme="gray" size="lg" color="gray.400" mt={4}>
            Manage
          </Button>
        </VStack>

        <HStack justify="space-between" pt={8} pb={2} px={4} position="fixed" bottom={0} left={0} right={0} bg="gray.900">
          <VStack spacing={1}>
            <IconButton
              icon={<Image src="/assets/coins/ton.svg" boxSize="20px" />}
              variant="ghost"
              color="blue.400"
            />
            <Text fontSize="xs" color="blue.400">Wallet</Text>
          </VStack>
          <VStack spacing={1}>
            <IconButton
              icon={<TimeIcon />}
              variant="ghost"
              color="gray.500"
              onClick={() => setShowHistory(true)}
            />
            <Text fontSize="xs" color="gray.500">History</Text>
          </VStack>
          <VStack spacing={1}>
            <IconButton
              icon={<ExternalLinkIcon />}
              variant="ghost"
              color="gray.500"
              onClick={() => setShowBrowser(true)}
            />
            <Text fontSize="xs" color="gray.500">Browser</Text>
          </VStack>
          <VStack spacing={1}>
            <IconButton
              icon={<StarIcon />}
              variant="ghost"
              color="gray.500"
              onClick={() => setShowCollectibles(true)}
            />
            <Text fontSize="xs" color="gray.500">Collectibles</Text>
          </VStack>
        </HStack>
      </VStack>
      {showSend && <Send onClose={() => {
        setShowSend(false);
        
        // Get navigation info
        const previousScreen = window.localStorage.getItem('previousScreen');
        
        // Clean up flags
        window.localStorage.removeItem('previousScreen');
        
        // Handle navigation based on previous screen
        if (previousScreen === 'cryptoDetail') {
          setShowCryptoDetail(true);
        }
        // For any other case, just return to wallet home (do nothing)
      }} />}
      {showCryptoDetail && (
        <ErrorBoundary onBack={() => setShowCryptoDetail(false)}>
          <CryptoDetail onBack={() => setShowCryptoDetail(false)} selectedCoin={selectedCoin} />
        </ErrorBoundary>
      )}
      {showReceive && <Receive onClose={() => {
        setShowReceive(false);
        
        // Get navigation info
        const previousScreen = window.localStorage.getItem('previousScreen');
        
        // Clean up flags
        window.localStorage.removeItem('previousScreen');
        
        // Handle navigation based on previous screen
        if (previousScreen === 'cryptoDetail') {
          setShowCryptoDetail(true);
        }
        // For any other case, just return to wallet home (do nothing)
      }} selectedCoin={selectedCoin} />}
      {showSwap && <Swap onClose={() => {
        setShowSwap(false);
        
        // Get navigation info
        const previousScreen = window.localStorage.getItem('previousScreen');
        
        // Clean up flags
        window.localStorage.removeItem('previousScreen');
        
        // Handle navigation based on previous screen
        if (previousScreen === 'cryptoDetail') {
          setShowCryptoDetail(true);
        }
        // For any other case, just return to wallet home (do nothing)
      }} />}
      {showHistory && <TransactionHistory onClose={() => setShowHistory(false)} />}
      {showBrowser && <Browser onClose={() => setShowBrowser(false)} />}
      {showCollectibles && <Collectibles onClose={() => setShowCollectibles(false)} />}
      {showSettings && <Settings onClose={() => setShowSettings(false)} logout={handleLogout} />}
      {showBuySell && <BuySell onClose={() => {
        setShowBuySell(false);
        
        // Get navigation info
        const previousScreen = window.localStorage.getItem('previousScreen');
        
        // Clean up flags
        window.localStorage.removeItem('previousScreen');
        
        // Handle navigation based on previous screen
        if (previousScreen === 'cryptoDetail') {
          setShowCryptoDetail(true);
        }
        // For any other case, just return to wallet home (do nothing)
      }} selectedCoin={selectedCoin || 'BTC'} />}
      {showPriceAlerts && <PriceAlerts onClose={() => setShowPriceAlerts(false)} />}
      {showPortfolio && <Portfolio onClose={() => setShowPortfolio(false)} />}
      {showEthTester && <EthTester onBack={() => setShowEthTester(false)} />}
    </Box>
  );
}

export default App;