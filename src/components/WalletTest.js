
import React, { useEffect, useState } from 'react';
import { createWallet, getBalance } from '../services/alchemyService';
import { Box, Text, Button } from '@chakra-ui/react';

const WalletTest = () => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);

  const testConnection = async () => {
    try {
      const newWallet = await createWallet();
      setWallet(newWallet);
      const bal = await getBalance(newWallet.address);
      setBalance(bal);
    } catch (error) {
      console.error('Alchemy connection error:', error);
    }
  };

  return (
    <Box p={4}>
      <Button onClick={testConnection}>Test Alchemy Connection</Button>
      {wallet && (
        <Box mt={4}>
          <Text>Address: {wallet.address}</Text>
          <Text>Balance: {balance} ETH</Text>
        </Box>
      )}
    </Box>
  );
};

export default WalletTest;
