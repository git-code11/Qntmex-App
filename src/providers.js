import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { ethers } from 'ethers';

// Set up providers for different blockchains
export const getEthereumProvider = (type = 'https') => {
  try {
    // Mainnet provider options - using public providers for better reliability
    const mainnetOptions = {
      https: 'https://eth-mainnet.g.alchemy.com/v2/demo',
      websocket: 'wss://eth-mainnet.g.alchemy.com/v2/demo',
      fallback: 'https://cloudflare-eth.com' // Cloudflare's public endpoint as fallback
    };

    if (type === 'websocket') {
      try {
        return new ethers.providers.WebSocketProvider(mainnetOptions.websocket);
      } catch (wsError) {
        console.error('WebSocket provider failed, falling back to HTTPS:', wsError);
        return new ethers.providers.JsonRpcProvider(mainnetOptions.https);
      }
    }

    try {
      return new ethers.providers.JsonRpcProvider(mainnetOptions.https);
    } catch (httpsError) {
      console.error('Primary HTTPS provider failed, using fallback:', httpsError);
      return new ethers.providers.JsonRpcProvider(mainnetOptions.fallback);
    }
  } catch (error) {
    console.error('Failed to create any Ethereum provider:', error);
    // Return a FallbackProvider that works even in read-only mode
    return new ethers.providers.FallbackProvider([
      new ethers.providers.InfuraProvider('mainnet', 'f6a6f3e3c0354a00a7f956626ef64614'),
      new ethers.providers.AlchemyProvider('mainnet', 'demo'),
      new ethers.providers.EtherscanProvider('mainnet'),
      new ethers.providers.CloudflareProvider()
    ], 1); // Only need 1 provider to respond successfully
  }
};

// Provider for Tron network
export const getTronProvider = () => {
  try {
    // For TRON, we would use TronWeb but for demo we'll return null
    console.log('Using mock Tron provider');
    return {
      type: 'mock',
      network: 'tron'
    };
  } catch (error) {
    console.error('Failed to create Tron provider:', error);
    return null;
  }
};

// Provider for Solana network
export const getSolanaProvider = () => {
  try {
    // For Solana, we would use @solana/web3.js but for demo we'll return null
    console.log('Using mock Solana provider');
    return {
      type: 'mock',
      network: 'solana'
    };
  } catch (error) {
    console.error('Failed to create Solana provider:', error);
    return null;
  }
};

// Get the preferred provider based on the selected network
export const getProviderForNetwork = (network, type = 'https') => {
  switch (network) {
    case 'ETH':
      return getEthereumProvider(type);
    case 'TRX':
      return getTronProvider();
    case 'SOL':
      return getSolanaProvider();
    default:
      console.warn(`No provider available for network ${network}, using Ethereum`);
      return getEthereumProvider(type);
  }
};

export default {
  getEthereumProvider,
  getTronProvider,
  getSolanaProvider,
  getProviderForNetwork
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 56, 137] // Ethereum, BSC, Polygon
});

export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: 'https://eth.llamarpc.com', // Use primary Ethereum URL (HTTPS for reliability)
    56: 'https://bsc-dataseed.binance.org',
    137: 'https://polygon-rpc.com'
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 12000
});


export const getWalletBalance = async (address, chainId = 1, network = 'ETH') => {
  const provider = getProviderForNetwork(network, 'https'); // Use HTTPS for reliability
  if (provider && provider.type !== 'mock') { //Check for mock provider
    try {
      const balance = await provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return null; // Return null on error
    }
  } else {
    console.warn('Using mock provider, balance unavailable.');
    return null;
  }
};