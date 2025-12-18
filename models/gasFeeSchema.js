const mongoose = require("mongoose");

const gasFeeSchema = new mongoose.Schema(
  {
    appId: {
      type: Number,
      required: true,
    },
    userId: {
      type: String, // Assuming it's a wallet address or user reference ID
      required: true,
    },
    gasAmount: {
      type: Number, // Amount in microAlgos or desired unit
      required: true,
    },
    gasType: {
      type: String, // Amount in microAlgos or desired unit
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const GasFee = mongoose.model("GasFee", gasFeeSchema, "gasFee");

module.exports = GasFee;
