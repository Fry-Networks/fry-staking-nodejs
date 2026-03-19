const logger = require("../config/logger");
const AiInteraction = require("../models/aiInteractionSchema");

const INDEXER_BASE = "https://mainnet-idx.4160.nodely.dev";
const FRY_ASA_ID = 2485314946;
const ADMIN_WALLET = "E2F2LT2INE75DBOYHQXTCTOP2PAP5MHAXQRXTTCCXFKHQTVG36DJONBQZE";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(url);
    if (res.ok || res.status === 404) return res;
    if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
      const delay = Math.min(200 * Math.pow(2, attempt - 1), 2000);
      logger.warn(`paymentVerification: retry ${attempt}/${maxRetries} for ${res.status}`);
      await sleep(delay);
      continue;
    }
    throw new Error(`Indexer returned ${res.status}`);
  }
}

/**
 * Verify a FRY payment transaction on Algorand.
 * @param {string} txId - Transaction ID
 * @param {number} expectedAmount - Minimum FRY amount in micro-units
 * @param {string} senderWallet - Expected sender address
 * @returns {{ verified: boolean, error?: string }}
 */
async function verifyFryPayment(txId, expectedAmount, senderWallet) {
  // Check replay: has this txId already been used?
  const existing = await AiInteraction.findOne({ paymentTxId: txId }).lean();
  if (existing) {
    return { verified: false, error: "Transaction already used" };
  }

  // Query indexer for the transaction
  const url = `${INDEXER_BASE}/v2/transactions/${txId}`;
  let res;
  try {
    res = await fetchWithRetry(url);
  } catch (err) {
    logger.error(`paymentVerification: indexer error for txId ${txId}: ${err.message}`);
    return { verified: false, error: "Failed to query transaction" };
  }

  if (res.status === 404) {
    return { verified: false, error: "Transaction not found" };
  }

  const json = await res.json();
  const tx = json.transaction;
  if (!tx) {
    return { verified: false, error: "Invalid transaction response" };
  }

  // Must be confirmed
  if (!tx["confirmed-round"]) {
    return { verified: false, error: "Transaction not confirmed" };
  }

  // Must be an asset transfer
  const axfer = tx["asset-transfer-transaction"];
  if (tx["tx-type"] !== "axfer" || !axfer) {
    return { verified: false, error: "Not an asset transfer transaction" };
  }

  // Must be FRY token
  if (axfer["asset-id"] !== FRY_ASA_ID) {
    return { verified: false, error: "Wrong asset (expected FRY)" };
  }

  // Amount must be sufficient
  if (axfer.amount < expectedAmount) {
    return { verified: false, error: `Insufficient amount: ${axfer.amount} < ${expectedAmount}` };
  }

  // Receiver must be admin wallet
  if (axfer.receiver !== ADMIN_WALLET) {
    return { verified: false, error: "Wrong receiver" };
  }

  // Sender must match the authenticated user
  if (tx.sender !== senderWallet) {
    return { verified: false, error: "Sender does not match authenticated wallet" };
  }

  return { verified: true };
}

module.exports = { verifyFryPayment };
