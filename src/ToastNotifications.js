
import React from 'react';
import { 
  Box, 
  HStack, 
  VStack, 
  Text, 
  Icon, 
  useToast 
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';

// Create a reusable toast notification system
const useCustomToast = () => {
  const toast = useToast();
  
  const showToast = ({
    title,
    description,
    status = 'info',
    duration = 5000,
    isClosable = true,
    variant = 'left-accent',
    position = 'top'
  }) => {
    let icon;
    
    switch (status) {
      case 'success':
        icon = CheckCircleIcon;
        break;
      case 'warning':
        icon = WarningIcon;
        break;
      case 'error':
        icon = WarningIcon;
        break;
      case 'info':
      default:
        icon = InfoIcon;
        break;
    }
    
    return toast({
      position,
      duration,
      isClosable,
      render: () => (
        <Box 
          color="white" 
          p={4} 
          bg={`${status}.800`} 
          borderRadius="md"
          borderLeft={`4px solid ${status === 'success' ? 'green.400' : 
                          status === 'warning' ? 'orange.400' : 
                          status === 'error' ? 'red.400' : 'blue.400'}`}
          boxShadow="md"
          maxW="sm"
        >
          <HStack align="start" spacing={3}>
            <Icon as={icon} w={5} h={5} color={`${status}.200`} mt={1} />
            <VStack align="start" spacing={1}>
              {title && <Text fontWeight="bold">{title}</Text>}
              {description && <Text fontSize="sm">{description}</Text>}
            </VStack>
          </HStack>
        </Box>
      )
    });
  };
  
  const transactionToast = (type, amount, status = 'success') => {
    const icons = {
      'send': '↑',
      'receive': '↓',
      'swap': '↔',
      'buy': '+',
      'sell': '-'
    };
    
    const titles = {
      'send': 'Transaction Sent',
      'receive': 'Transaction Received',
      'swap': 'Swap Complete',
      'buy': 'Purchase Complete',
      'sell': 'Sale Complete'
    };
    
    return showToast({
      title: titles[type] || 'Transaction Complete',
      description: `${icons[type] || ''} ${amount}`,
      status: status,
      duration: 3000,
      isClosable: true
    });
  };
  
  return {
    showToast,
    transactionToast
  };
};

export default useCustomToast;
