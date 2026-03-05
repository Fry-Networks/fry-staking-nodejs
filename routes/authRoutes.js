const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const algosdk = require('algosdk');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory nonce store: wallet -> { nonce, expiresAt }
const nonceStore = new Map();

// Cleanup expired nonces periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [wallet, entry] of nonceStore) {
    if (now > entry.expiresAt) {
      nonceStore.delete(wallet);
    }
  }
}, NONCE_TTL_MS);

/**
 * POST /auth/nonce
 * Body: { wallet: "ALGO_ADDRESS" }
 * Returns: { nonce: "hex_string" }
 */
router.post('/nonce', (req, res) => {
  const { wallet } = req.body;
  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ success: false, message: 'wallet is required' });
  }

  // Validate it looks like an Algorand address
  if (!algosdk.isValidAddress(wallet)) {
    return res.status(400).json({ success: false, message: 'Invalid Algorand address' });
  }

  const nonce = crypto.randomBytes(32).toString('hex');
  nonceStore.set(wallet, { nonce, expiresAt: Date.now() + NONCE_TTL_MS });

  return res.json({ success: true, nonce });
});

/**
 * POST /auth/verify
 * Body: { wallet, signedTxn (base64), nonce }
 * Returns: { token: "jwt_string" }
 *
 * The frontend signs a zero-ALGO self-payment transaction with the nonce
 * embedded in the note field, using @txnlab/use-wallet's transactionSigner.
 * This endpoint decodes the signed transaction and verifies:
 *   1. The sender matches the claimed wallet
 *   2. The note contains the expected nonce
 *   3. The signature is valid (via Algorand simulate API, supports rekeyed accounts)
 */
router.post('/verify', async (req, res) => {
  const { wallet, signedTxn, nonce } = req.body;

  if (!wallet || !signedTxn || !nonce) {
    return res.status(400).json({ success: false, message: 'wallet, signedTxn, and nonce are required' });
  }

  // Check nonce exists and matches
  const stored = nonceStore.get(wallet);
  if (!stored || stored.nonce !== nonce) {
    return res.status(401).json({ success: false, message: 'Invalid or expired nonce' });
  }

  // Check TTL
  if (Date.now() > stored.expiresAt) {
    nonceStore.delete(wallet);
    return res.status(401).json({ success: false, message: 'Nonce expired' });
  }

  // Consume nonce (single use)
  nonceStore.delete(wallet);

  try {
    // Decode the signed transaction
    const stxnBytes = Buffer.from(signedTxn, 'base64');
    const decoded = algosdk.decodeSignedTransaction(stxnBytes);
    const txn = decoded.txn;

    // Verify sender matches claimed wallet
    const sender = txn.sender.toString();
    if (sender !== wallet) {
      return res.status(401).json({ success: false, message: 'Transaction sender does not match wallet' });
    }

    // Verify note contains the nonce
    const noteStr = txn.note ? Buffer.from(txn.note).toString('utf8') : '';
    if (!noteStr.includes(nonce)) {
      return res.status(401).json({ success: false, message: 'Transaction note does not contain nonce' });
    }

    // Verify signature via Algorand simulate API
    // This correctly handles rekeyed accounts and SDK encoding differences
    const algodClient = new algosdk.Algodv2('', 'https://mainnet-api.4160.nodely.dev', 443);
    const simRequest = new algosdk.modelsv2.SimulateRequest({
      txnGroups: [
        new algosdk.modelsv2.SimulateRequestTransactionGroup({ txns: [decoded] })
      ],
      allowEmptySignatures: false,
    });
    const simResult = await algodClient.simulateTransactions(simRequest).do();
    const groupFailure = simResult.txnGroups[0].failureMessage;

    if (groupFailure) {
      return res.status(401).json({ success: false, message: 'Transaction verification failed' });
    }

    const token = jwt.sign({ wallet }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token });
  } catch (err) {
    console.error('Auth verify error:', err);
    return res.status(500).json({ success: false, message: 'Verification error' });
  }
});

module.exports = router;
