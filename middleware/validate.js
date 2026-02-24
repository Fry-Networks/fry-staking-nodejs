const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }
    next();
  };
};

// Staking pool creation schema
const stakingSchema = Joi.object({
  creatorId: Joi.string().required(),
  stakeToken: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  rewardToken: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  stakingStartTime: Joi.number().required(),
  stakingEndTime: Joi.number().required(),
  stakingTime: Joi.number().default(0),
  duration: Joi.number().required(),
  aprRate: Joi.number().required(),
  rewardTokenAmount: Joi.number().required(),
  stakingContractId: Joi.string().required(),
  lockPeriod: Joi.number().required(),
});

// Farming pool creation schema
const farmingSchema = Joi.object({
  creatorId: Joi.string().required(),
  lpToken: Joi.object({
    tokenA: Joi.string().required(),
    tokenB: Joi.string().required(),
  }).required(),
  rewardToken: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().allow(''),
  }).required(),
  rewardTokenAmount: Joi.number().required(),
  farmStartTime: Joi.number().required(),
  farmEndTime: Joi.number().required(),
  duration: Joi.number().required(),
  lockPeriod: Joi.number().required(),
  farmEntryFee: Joi.number().required(),
  rewardDistributionRate: Joi.number().required(),
  rewardDistributionSchedule: Joi.number().required(),
  fryRewardFee: Joi.number().required(),
  aprRate: Joi.number().default(0),
  appId: Joi.number().required(),
});

// Token creation schema
const tokenSchema = Joi.object({
  tokenId: Joi.number().required(),
  tokenName: Joi.string().required(),
  tokenSymbol: Joi.string().required(),
  tokenImage: Joi.string().required(),
}).unknown(true);

// Claim reward schema
const claimRewardSchema = Joi.object({
  walletId: Joi.string().required(),
  poolId: Joi.string().required(),
  rewardClaimed: Joi.number().required(),
  stakedAmount: Joi.number().required(),
  stakedTime: Joi.number().required(),
});

// Claim farm reward schema
const claimFarmRewardSchema = Joi.object({
  walletId: Joi.string().required(),
  poolId: Joi.string().required(),
  rewardClaimed: Joi.number().required(),
  stakedAmount: Joi.number().required(),
  stakeStartTime: Joi.number().required(),
  claimTime: Joi.number().required(),
});

// Withdraw schema
const withdrawSchema = Joi.object({
  tokens: Joi.number().required(),
  wallet: Joi.string().required(),
  poolId: Joi.string().required(),
  appId: Joi.number().required(),
});

// Farming withdraw schema
const farmingWithdrawSchema = Joi.object({
  amount: Joi.number().required(),
  userWallet: Joi.string().required(),
  poolId: Joi.string().required(),
  farmingTokenId: Joi.string().required(),
});

// Gas fee schema
const gasFeeSchema = Joi.object({
  appId: Joi.number().required(),
  userId: Joi.string().required(),
  gasAmount: Joi.number().required(),
  gasType: Joi.string().required(),
});

// Swap history schema
const swapHistorySchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().required(),
  token1: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  token2: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  liquidityPoolId: Joi.string().required(),
  fee: Joi.number().required(),
});

// Staker data schema
const stakerDataSchema = Joi.object({
  walletId: Joi.string().required(),
  stakedAmount: Joi.number().required(),
  stakeTime: Joi.number().required(),
  poolId: Joi.string().required(),
  rewardClaimed: Joi.number().default(0),
});

module.exports = {
  validate,
  stakingSchema,
  farmingSchema,
  tokenSchema,
  claimRewardSchema,
  claimFarmRewardSchema,
  withdrawSchema,
  farmingWithdrawSchema,
  gasFeeSchema,
  swapHistorySchema,
  stakerDataSchema,
};
