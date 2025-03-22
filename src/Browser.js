
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  Button,
} from "@chakra-ui/react";
import { CloseIcon, SearchIcon, ExternalLinkIcon } from "@chakra-ui/icons";

export default function Browser({ onClose }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dapps] = React.useState([
    { name: 'Ton Diamonds', url: 'https://tondapp.org/diamonds', description: 'NFT Marketplace' },
    { name: 'Getgems', url: 'https://getgems.io', description: 'NFT Collections' },
    { name: 'Dedust', url: 'https://dedust.io', description: 'DEX Trading' }
  ]);

  const handleSearch = () => {
    if (searchQuery.startsWith('http')) {
      window.open(searchQuery, '_blank');
    } else {
      window.open(`https://google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
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
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" alignItems="center">
          <IconButton
            icon={<CloseIcon />}
            variant="ghost"
            color="white"
            onClick={onClose}
            size="sm"
          />
          <Text fontSize="xl" color="white">Browser</Text>
          <Box w="40px"/>
        </HStack>
        
        <HStack>
          <Input 
            placeholder="Search or enter website" 
            bg="gray.800"
            color="white"
            _placeholder={{ color: 'gray.500' }}
          />
          <IconButton
            icon={<SearchIcon />}
            colorScheme="blue"
          />
        </HStack>

        <VStack spacing={4} align="stretch">
          <Text color="gray.400" fontSize="sm">Popular DApps</Text>
          {dapps.map((dapp, index) => (
            <Box 
              key={index}
              p={4} 
              bg="gray.800" 
              borderRadius="xl"
              cursor="pointer"
              onClick={() => window.open(dapp.url, '_blank')}
              _hover={{ bg: 'gray.700' }}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text color="white">{dapp.name}</Text>
                  <Text color="gray.500" fontSize="sm">{dapp.description}</Text>
                </VStack>
                <ExternalLinkIcon color="gray.500" />
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
