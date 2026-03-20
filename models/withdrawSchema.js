const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  chainId: {
    type: String,
    default: 'algorand-mainnet',
    enum: ['algorand-mainnet', 'voi-mainnet'],
    index: true,
  },
  tokens: {
    type: Number,
    required: true,
  },
  wallet: {
    type: String,
    required: true,
  },
  poolId: {
    type: String,
    required: true,
  },
  appId: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const Withdraw = mongoose.model("Withdraw", withdrawSchema, "withdrawalTokens");
module.exports = Withdraw;
