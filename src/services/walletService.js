
import { ethers } from 'ethers';
import { getBalance } from './alchemyService';

// In-memory cache for balances (in a real app, this would be persisted)
let balanceCache = {};

// Get ETH balance for a wallet address
export const getEthBalance = async (address) => {
  try {
    const balance = await getBalance(address);
    return balance;
  } catch (error) {
    console.error("Error getting ETH balance:", error);
    return "0";
  }
};

// Get token balances (ERC-20) for a wallet address
export const getTokenBalances = async (address, tokens) => {
  try {
    // In a real app, you would fetch token balances from the blockchain
    // For now, we'll return mock data for demo purposes
    const mockBalances = {
      'USDT': 100,
      'USDC': 100
    };
    
    return mockBalances;
  } catch (error) {
    console.error("Error getting token balances:", error);
    return {};
  }
};

// Generate a wallet recovery phrase
export const generateRecoveryPhrase = () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet.mnemonic.phrase;
};

// Create a wallet from recovery phrase
export const createWalletFromMnemonic = (mnemonic) => {
  try {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic
    };
  } catch (error) {
    console.error("Error creating wallet from mnemonic:", error);
    throw new Error("Invalid recovery phrase");
  }
};

// Send ETH from one wallet to another
export const sendEth = async (fromPrivateKey, toAddress, amount) => {
  try {
    // In a real app, this would send an actual transaction
    // For demo purposes, we'll just log it
    console.log(`Sending ${amount} ETH from wallet to ${toAddress}`);
    
    // Return mock transaction data
    return {
      hash: `0x${Math.random().toString(16).substring(2, 10)}`,
      amount,
      to: toAddress,
      from: new ethers.Wallet(fromPrivateKey).address,
      status: 'pending'
    };
  } catch (error) {
    console.error("Error sending ETH:", error);
    throw error;
  }
};

// For demo purposes - store transaction history in localStorage
export const saveTransaction = (userId, transaction) => {
  try {
    const historyKey = `tx_history_${userId}`;
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    transaction.timestamp = Date.now();
    history.push(transaction);
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving transaction:", error);
  }
};

// Get transaction history for a user
export const getTransactionHistory = (userId) => {
  try {
    const historyKey = `tx_history_${userId}`;
    return JSON.parse(localStorage.getItem(historyKey) || '[]');
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return [];
  }
};
