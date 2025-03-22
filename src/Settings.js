import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Switch,
  Divider,
  useColorMode,
  Select,
  useToast,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Spinner
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { Moon, Globe, Bell, Shield, HelpCircle } from "react-feather";
import { useNavigate } from 'react-router-dom';
import WalletTester from './components/WalletTester';
import { useAuth } from './AuthContext';
import testAllAPIs from './utils/apiTester'; // Import the API testing utility


export default function Settings({ onClose, logout }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const [theme, setTheme] = useState(colorMode);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(false);
  const [language, setLanguage] = useState('English');
  const toast = useToast();
  const [loading, setLoading] = useState(false); // Added loading state
  const [apiStatus, setApiStatus] = useState(null); // State to hold API test results
  const [testing, setTesting] = useState(false); // State to track testing progress
  const walletAddress = user ? (localStorage.getItem(`wallet_${user.uid}`) ? JSON.parse(localStorage.getItem(`wallet_${user.uid}`)).address : null) : null;


  const handleThemeChange = () => {
    toggleColorMode();
  };
  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleSecurityClick = () => {
    toast({
      title: "Security Options",
      description: "Security settings are not available in demo mode",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleHelpClick = () => {
    toast({
      title: "Help Center",
      description: "Help documentation is not available in demo mode",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const runApiTests = async () => {
    setTesting(true);
    try {
      const results = await testAllAPIs();
      setApiStatus(results);
    } catch (error) {
      console.error("Error testing APIs:", error);
      setApiStatus({ error: "Failed to test APIs" });
    } finally {
      setTesting(false);
    }
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
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <IconButton
            icon={<CloseIcon />}
            variant="ghost"
            color="white"
            onClick={handleClose}
            size="sm"
          />
          <Text fontSize="xl" color="white">Settings</Text>
          <Box w="24px" />
        </HStack>

        <Tabs colorScheme="blue" variant="soft-rounded">
          <TabList>
            <Tab color="gray.300" _selected={{ color: "white", bg: "blue.800" }}>General</Tab>
            <Tab color="gray.300" _selected={{ color: "white", bg: "blue.800" }}>Wallet Tools</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch" p={2}>
                <HStack justify="space-between" p={4} bg="gray.800" borderRadius="xl">
                  <HStack>
                    <Moon color="white" size={20} />
                    <Text color="white">Dark Mode</Text>
                  </HStack>
                  <Switch
                    isChecked={colorMode === 'dark'}
                    onChange={handleThemeChange}
                    colorScheme="blue"
                  />
                </HStack>

                <HStack justify="space-between" p={4} bg="gray.800" borderRadius="xl">
                  <HStack>
                    <Globe color="white" size={20} />
                    <Text color="white">Language</Text>
                  </HStack>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    width="100px"
                    size="sm"
                    color="gray.400"
                    bg="gray.700"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </Select>
                </HStack>

                <HStack justify="space-between" p={4} bg="gray.800" borderRadius="xl">
                  <HStack>
                    <Bell color="white" size={20} />
                    <Text color="white">Notifications</Text>
                  </HStack>
                  <Switch
                    isChecked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    colorScheme="blue"
                  />
                </HStack>

                <Divider borderColor="gray.700" />

                <HStack
                  justify="space-between"
                  p={4}
                  bg="gray.800"
                  borderRadius="xl"
                  onClick={handleSecurityClick}
                  cursor="pointer"
                  _hover={{ bg: "gray.700" }}
                >
                  <HStack>
                    <Shield color="white" size={20} />
                    <Text color="white">Security</Text>
                  </HStack>
                </HStack>

                <HStack
                  justify="space-between"
                  p={4}
                  bg="gray.800"
                  borderRadius="xl"
                  onClick={handleHelpClick}
                  cursor="pointer"
                  _hover={{ bg: "gray.700" }}
                >
                  <HStack>
                    <HelpCircle color="white" size={20} />
                    <Text color="white">Help Center</Text>
                  </HStack>
                </HStack>

                <Divider my={4} borderColor="gray.700" />
                <Button
                  colorScheme="blue"
                  onClick={runApiTests}
                  isLoading={testing}
                  loadingText="Testing APIs"
                  mb={3}
                >
                  Test API Connections
                </Button>

                {apiStatus && (
                  <Box bg="gray.800" p={3} borderRadius="md" mb={4} w="full">
                    <Text fontWeight="bold" mb={2}>API Status:</Text>
                    {Object.entries(apiStatus).map(([api, working]) => (
                      <HStack key={api} justify="space-between" mb={1}>
                        <Text>{api}</Text>
                        <Text color={working ? "green.400" : "red.400"}>
                          {working ? "✓ Working" : "✗ Not working"}
                        </Text>
                      </HStack>
                    ))}
                  </Box>
                )}

                <Button
                  colorScheme="red"
                  onClick={() => {
                    // Close settings panel first
                    if (onClose) onClose();
                    // Use the passed in logout function from App.js which handles the overlay
                    logout();
                  }}
                  width="100%"
                  mt={4}
                >
                  Logout
                </Button>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Text color="gray.300" fontSize="sm">
                  Use these tools to test your wallet functionality without making real transactions.
                </Text>
                <WalletTester walletAddress={walletAddress} />
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
}