const mongoose = require("mongoose");

const farmingSchema = new mongoose.Schema({
  creatorId: {
    type: String,
    required: true,
  },
  lpToken: {
    tokenA: {
      type: String,
      required: true,
    },
    tokenB: {
      type: String,
      required: true,
    },
  },
  rewardToken: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
  },
  rewardTokenAmount: {
    type: Number,
    required: true,
  },
  farmStartTime: {
    type: Number,
    required: true,
  },
  farmEndTime: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  lockPeriod: {
    type: Number,
    required: true,
  },
  farmEntryFee: {
    type: Number,
    required: true,
  },
  rewardDistributionRate: {
    type: Number,
    required: true,
  },
  rewardDistributionSchedule: {
    type: Number,
    required: true,
  },
  fryRewardFee: {
    type: Number,
    required: true,
  },
  aprRate: {
    type: Number,
    default: 0,
  },
  totalFarmers: {
    type: Number,
    default: 0,
  },
  totalStaked: {
    type: Number,
    default: 0,
  },
  rewardsDistributed: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  appId: {
    type: Number,
    required: true,
  },
});

const Farming = mongoose.model("Farming", farmingSchema, "farmingPools");
module.exports = Farming;
