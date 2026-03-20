/**
 * Multi-chain configuration for fry.farm backend
 *
 * Each chain has: endpoints (with fallbacks for circuit breaker),
 * indexer endpoints, asset IDs, and feature flags.
 */

const chains = {
  'algorand-mainnet': {
    chainId: 'algorand-mainnet',
    displayName: 'Algorand',
    family: 'avm',
    nativeAsset: { name: 'Algo', symbol: 'ALGO', decimals: 6, id: 0 },
    /** Ordered by priority — circuit breaker in algodService uses this order */
    algodEndpoints: [
      { name: 'ATLAS00', server: 'http://192.168.9.2', port: 4190, token: process.env.ATLAS00_ALGOD_TOKEN || '' },
      { name: 'Nodely', server: 'https://mainnet-api.4160.nodely.dev', port: 443, token: '' },
      { name: 'Algonode', server: 'https://mainnet-api.algonode.cloud', port: 443, token: '' },
    ],
    indexerEndpoints: [
      { name: 'Nodely', server: 'https://mainnet-idx.4160.nodely.dev', port: 443, token: '' },
      { name: 'Algonode', server: 'https://mainnet-idx.algonode.cloud', port: 443, token: '' },
    ],
    fryTokenId: 2485314946,
    usdcId: 31566704,
    feeRecipient: process.env.FEE_RECIPIENT || 'E2F2LT2INE75DBOYHQXTCTOP2PAP5MHAXQRXTTCCXFKHQTVG36DJONBQZE',
    explorerBaseUrl: 'https://explorer.perawallet.app',
    features: {
      staking: true,
      farming: true,
      nftStaking: true,
      deviceStaking: true,
      swap: true,
      predictionLp: true,
      communityEvents: true,
    },
  },
  'voi-mainnet': {
    chainId: 'voi-mainnet',
    displayName: 'Voi',
    family: 'avm',
    nativeAsset: { name: 'Voi', symbol: 'VOI', decimals: 6, id: 0 },
    algodEndpoints: [
      { name: 'Nodely', server: 'https://mainnet-api.voi.nodely.dev', port: 443, token: '' },
    ],
    indexerEndpoints: [
      { name: 'Nodely', server: 'https://mainnet-idx.voi.nodely.dev', port: 443, token: '' },
    ],
    fryTokenId: null,
    usdcId: null,
    feeRecipient: null,
    explorerBaseUrl: 'https://explorer.voi.network',
    features: {
      staking: false,
      farming: false,
      nftStaking: false,
      deviceStaking: false,
      swap: false,
      predictionLp: false,
      communityEvents: false,
    },
  },
};

const DEFAULT_CHAIN_ID = 'algorand-mainnet';

function getChainConfig(chainId) {
  const config = chains[chainId];
  if (!config) {
    throw new Error(`Unknown chain: ${chainId}. Supported: ${Object.keys(chains).join(', ')}`);
  }
  return config;
}

function getAllChains() {
  return Object.values(chains);
}

function getDefaultChainConfig() {
  return getChainConfig(DEFAULT_CHAIN_ID);
}

function isValidChainId(id) {
  return id in chains;
}

module.exports = {
  chains,
  DEFAULT_CHAIN_ID,
  getChainConfig,
  getAllChains,
  getDefaultChainConfig,
  isValidChainId,
};
