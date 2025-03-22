
import { ETHERSCAN_API_KEY } from '../config';

// Function to get basic token transactions for an address
export const getTokenTransactions = async (address) => {
  try {
    if (!ETHERSCAN_API_KEY) {
      console.warn('Etherscan API key is missing');
      return [];
    }

    const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Etherscan API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== '1') {
      console.warn('Etherscan API returned an error:', data.message);
      return [];
    }
    
    return data.result.map(tx => ({
      hash: tx.hash,
      timeStamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
      from: tx.from,
      to: tx.to,
      value: tx.value,
      tokenName: tx.tokenName,
      tokenSymbol: tx.tokenSymbol,
      tokenDecimal: parseInt(tx.tokenDecimal),
      contractAddress: tx.contractAddress,
      confirmations: parseInt(tx.confirmations),
      blockNumber: parseInt(tx.blockNumber)
    }));
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    return [];
  }
};

// Function to get normal ETH transactions
export const getEthTransactions = async (address) => {
  try {
    if (!ETHERSCAN_API_KEY) {
      console.warn('Etherscan API key is missing');
      return [];
    }

    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Etherscan API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== '1') {
      console.warn('Etherscan API returned an error:', data.message);
      return [];
    }
    
    return data.result.map(tx => ({
      hash: tx.hash,
      timeStamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
      from: tx.from,
      to: tx.to,
      value: tx.value,
      confirmations: parseInt(tx.confirmations),
      blockNumber: parseInt(tx.blockNumber),
      isError: tx.isError === '1'
    }));
  } catch (error) {
    console.error('Error fetching ETH transactions:', error);
    return [];
  }
};

// Get ETH balance for an address
export const getEthBalance = async (address) => {
  try {
    if (!ETHERSCAN_API_KEY) {
      console.warn('Etherscan API key is missing');
      return '0';
    }

    const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Etherscan API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== '1') {
      console.warn('Etherscan API returned an error:', data.message);
      return '0';
    }
    
    // Convert from wei to ETH
    return (parseInt(data.result) / 1e18).toString();
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return '0';
  }
};

export default {
  getTokenTransactions,
  getEthTransactions,
  getEthBalance
};
