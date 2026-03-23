#!/usr/bin/env node
/**
 * Manual test for Algorand swap service (aVOI → ALGO → FRY).
 *
 * Checks E2F2LT aVOI balance and swaps ALL available aVOI to FRY
 * via the 2-hop route: aVOI → ALGO (Folks Router) → FRY (Vestige).
 *
 * DO NOT run unattended — this sends REAL funds.
 *
 * Usage:
 *   node scripts/testAlgorandSwap.js          # swap all aVOI
 *   node scripts/testAlgorandSwap.js quote     # quote only, no execution
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const axios = require("axios");
const { swapAvoiToFry, getSwapQuote, MIN_SWAP_THRESHOLD, AVOI_ASA_ID } = require("../services/algorandSwapService");

const ADMIN_WALLET = 'E2F2LT2INE75DBOYHQXTCTOP2PAP5MHAXQRXTTCCXFKHQTVG36DJONBQZE';

async function getAvoiBalance() {
  const { data } = await axios.get(
    `https://mainnet-api.algonode.cloud/v2/accounts/${ADMIN_WALLET}`,
    { timeout: 10000 },
  );
  const avoiAsset = (data.assets || []).find((a) => a['asset-id'] === AVOI_ASA_ID);
  return avoiAsset ? avoiAsset.amount : 0;
}

async function main() {
  const quoteOnly = process.argv[2] === 'quote';

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("FATAL: MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB\n");

  // Check aVOI balance
  const balance = await getAvoiBalance();
  console.log(`E2F2LT aVOI balance: ${balance / 1e6} aVOI (${balance} micro)`);

  if (balance < MIN_SWAP_THRESHOLD) {
    console.log(`\nBalance below minimum threshold (${MIN_SWAP_THRESHOLD / 1e6} aVOI). Nothing to swap.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Get quote first
  console.log(`\nFetching quote for ${balance / 1e6} aVOI → FRY...`);
  const quote = await getSwapQuote(balance);
  console.log("Quote:", JSON.stringify(quote, null, 2));

  if (!quote.success) {
    console.error("\nQuote failed:", quote.error);
    await mongoose.disconnect();
    process.exit(1);
  }

  if (quoteOnly) {
    console.log("\n(Quote only mode — not executing swap)");
    await mongoose.disconnect();
    process.exit(0);
  }

  // Execute swap
  console.log(`\nExecuting swap: ${balance / 1e6} aVOI → FRY...`);
  console.log("---");

  const result = await swapAvoiToFry(balance, 'manual-test');

  console.log("\nResult:", JSON.stringify(result, null, 2));

  await mongoose.disconnect();
  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
