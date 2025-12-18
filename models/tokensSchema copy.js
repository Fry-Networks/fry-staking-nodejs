
const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
  },
  tokenName: {
    type: String,
    required: true,
  },
  tokenSymbol: {
    type: String,
    required: true,
  },
  tokenImage: {
    type: String,
    required: true,
  },
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
