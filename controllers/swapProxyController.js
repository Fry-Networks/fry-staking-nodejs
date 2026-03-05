const axios = require('axios');

const FOLKS_BASE = 'https://api.folksrouter.io/v1';
const VESTIGE_BASE = 'https://api.vestigelabs.org';
const REQUEST_TIMEOUT = 15000;

/**
 * GET /swap/folks/quote
 * Proxies to FolksRouter quote endpoint
 */
const proxyFolksQuote = async (req, res) => {
  try {
    const { data } = await axios.get(`${FOLKS_BASE}/fetch/quote`, {
      params: req.query,
      timeout: REQUEST_TIMEOUT,
    });
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json({
      success: false,
      message: err.response?.data?.message || 'FolksRouter quote failed',
    });
  }
};

/**
 * GET /swap/folks/prepare
 * Proxies to FolksRouter prepare/swap endpoint
 */
const proxyFolksPrepare = async (req, res) => {
  try {
    const { data } = await axios.get(`${FOLKS_BASE}/prepare/swap`, {
      params: req.query,
      timeout: REQUEST_TIMEOUT,
    });
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json({
      success: false,
      message: err.response?.data?.message || 'FolksRouter prepare failed',
    });
  }
};

/**
 * GET /swap/vestige/quote
 * Proxies to Vestige swap quote endpoint
 */
const proxyVestigeQuote = async (req, res) => {
  try {
    const { data } = await axios.get(`${VESTIGE_BASE}/swap/v4`, {
      params: req.query,
      timeout: REQUEST_TIMEOUT,
    });
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json({
      success: false,
      message: err.response?.data?.message || 'Vestige quote failed',
    });
  }
};

/**
 * POST /swap/vestige/transactions
 * Proxies to Vestige swap transactions endpoint
 */
const proxyVestigeTransactions = async (req, res) => {
  try {
    const { data } = await axios.post(`${VESTIGE_BASE}/swap/v4/transactions`, req.body, {
      params: req.query,
      timeout: REQUEST_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json({
      success: false,
      message: err.response?.data?.message || 'Vestige transactions failed',
    });
  }
};

/**
 * POST /swap/deflex/quote
 * Runs Deflex SDK server-side to get a swap quote
 */
const proxyDeflexQuote = async (req, res) => {
  try {
    const { fromASAId, toASAId, amount } = req.body;
    if (fromASAId === undefined || toASAId === undefined || amount === undefined) {
      return res.status(400).json({ success: false, message: 'fromASAId, toASAId, amount required' });
    }

    const { DeflexOrderRouterClient } = require('@deflex/deflex-sdk-js');
    const algodServer = process.env.ALGOD_SERVER || 'https://mainnet-api.algonode.cloud';
    const algodToken = process.env.ALGOD_TOKEN || '';
    const algodPort = process.env.ALGOD_PORT || '';

    const client = DeflexOrderRouterClient.fetchMainnetClient(algodServer, algodToken, algodPort);
    const quote = await client.getFixedInputSwapQuote(fromASAId, toASAId, amount);

    res.json({ success: true, quote });
  } catch (err) {
    console.error('Deflex quote error:', err.message);
    res.status(502).json({
      success: false,
      message: err.message || 'Deflex quote failed',
    });
  }
};

/**
 * POST /swap/deflex/transactions
 * Runs Deflex SDK server-side to get swap transactions
 * Returns serialized transactions as base64 with lsig indicators
 */
const proxyDeflexTransactions = async (req, res) => {
  try {
    const { address, quote, slippageBps } = req.body;
    if (!address || !quote || slippageBps === undefined) {
      return res.status(400).json({ success: false, message: 'address, quote, slippageBps required' });
    }

    const { DeflexOrderRouterClient } = require('@deflex/deflex-sdk-js');
    const algodServer = process.env.ALGOD_SERVER || 'https://mainnet-api.algonode.cloud';
    const algodToken = process.env.ALGOD_TOKEN || '';
    const algodPort = process.env.ALGOD_PORT || '';

    const client = DeflexOrderRouterClient.fetchMainnetClient(algodServer, algodToken, algodPort);
    const txnGroup = await client.getSwapQuoteTransactions(address, quote, slippageBps / 10000);

    // Serialize transactions for frontend
    const serialized = txnGroup.txns.map((t) => ({
      data: typeof t.data === 'string' ? t.data : Buffer.from(t.data).toString('base64'),
      hasLogicSig: t.logicSigBlob instanceof Uint8Array,
      logicSigBlob: t.logicSigBlob instanceof Uint8Array
        ? Buffer.from(t.logicSigBlob).toString('base64')
        : null,
    }));

    res.json({ success: true, txns: serialized });
  } catch (err) {
    console.error('Deflex transactions error:', err.message);
    res.status(502).json({
      success: false,
      message: err.message || 'Deflex transactions failed',
    });
  }
};

module.exports = {
  proxyFolksQuote,
  proxyFolksPrepare,
  proxyVestigeQuote,
  proxyVestigeTransactions,
  proxyDeflexQuote,
  proxyDeflexTransactions,
};
