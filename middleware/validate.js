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
  isGated: Joi.boolean().default(false),
  gateConfig: Joi.object({
    nftAsaId: Joi.number().default(0),
    nftCreatorAddress: Joi.string().allow('').default(''),
    collectionName: Joi.string().allow('').default(''),
    minNftCount: Joi.number().min(1).default(1),
    gateMessage: Joi.string().allow('').default('This pool requires an NFT to participate.'),
  }).default({}),
  contractVersion: Joi.number().default(1),
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
  poolType: Joi.string().valid('lp', 'single').default('lp'),
  dexProvider: Joi.string().allow('').default(''),
  stakeTokenName: Joi.string().allow('').default(''),
  stakeTokenSymbol: Joi.string().allow('').default(''),
  rewardTokenName: Joi.string().allow('').default(''),
  rewardTokenSymbol: Joi.string().allow('').default(''),
  lpPairName: Joi.string().allow('').default(''),
  isGated: Joi.boolean().default(false),
  gateConfig: Joi.object({
    nftAsaId: Joi.number().default(0),
    nftCreatorAddress: Joi.string().allow('').default(''),
    collectionName: Joi.string().allow('').default(''),
    minNftCount: Joi.number().min(1).default(1),
    gateMessage: Joi.string().allow('').default('This pool requires an NFT to participate.'),
  }).default({}),
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

// Daily reward claim schema
const dailyRewardClaimSchema = Joi.object({
  wallet: Joi.string().optional(),
  fingerprint: Joi.string().required(),
  turnstileToken: Joi.string().optional(),
});

// Rewards config update schema (partial update)
const rewardsConfigUpdateSchema = Joi.object({
  isEnabled: Joi.boolean(),
  rewardSchedule: Joi.array().items(Joi.number()),
  minAlgoBalance: Joi.number().min(0),
  minFryBalance: Joi.number().min(0),
  minWalletAgeDays: Joi.number().min(0),
  maxClaimsPerIpPerDay: Joi.number().min(1),
  maxClaimsPerFingerprintPerDay: Joi.number().min(1),
  minOnChainScore: Joi.number().min(0),
  streakResetHours: Joi.number().min(1),
  claimCooldownHours: Joi.number().min(1),
  trustTierThresholds: Joi.array().items(Joi.number()).length(3),
  trustTierMultipliers: Joi.array().items(Joi.number()).length(4),
  baselineClaimsPerHour: Joi.number().min(1),
  yellowMultiplier: Joi.number().min(1),
  orangeMultiplier: Joi.number().min(1),
  redMultiplier: Joi.number().min(1),
  maxDailyClaimsAutoCap: Joi.number().min(1),
  minTreasuryBalance: Joi.number().min(0),
  alertWebhookUrl: Joi.string().allow(''),
  adminWallets: Joi.array().items(Joi.string()),
  fryAsaId: Joi.number(),
  indexerUrl: Joi.string(),
}).min(1);

// Fee config update schema (partial update)
const feeConfigUpdateSchema = Joi.object({
  stakingDepositFeePercent: Joi.number().min(0).max(50),
  stakingWithdrawFeePercent: Joi.number().min(0).max(50),
  stakingClaimFeePercent: Joi.number().min(0).max(50),
  farmingDepositFeePercent: Joi.number().min(0).max(50),
  farmingWithdrawFeePercent: Joi.number().min(0).max(50),
  farmingClaimFeePercent: Joi.number().min(0).max(50),
  alphaArcadeDepositFeePercent: Joi.number().min(0).max(50),
  alphaArcadeWithdrawFeePercent: Joi.number().min(0).max(50),
  swapFeePercent: Joi.number().min(0).max(50),
  dailyClaimFeePercent: Joi.number().min(0).max(50),
  poolCreationFeePercent: Joi.number().min(0).max(50),
  poolCreationFeeUsd: Joi.number().min(0).max(1000),
  feeRecipient: Joi.string(),
  revShareStakers: Joi.number().min(0).max(100),
  revShareTreasury: Joi.number().min(0).max(100),
  revSharePoolCreator: Joi.number().min(0).max(100),
  revShareCompound: Joi.number().min(0).max(100),
}).min(1);

// Admin ban schema
const adminBanSchema = Joi.object({
  wallet: Joi.string().required(),
  reason: Joi.string().optional().allow(''),
});

// NFT staking pool creation schema
const nftStakingPoolSchema = Joi.object({
  creatorId: Joi.string().required(),
  appId: Joi.number().required(),
  name: Joi.string().required(),
  description: Joi.string().allow('').default(''),
  imageUrl: Joi.string().allow('').default(''),
  rewardTokenId: Joi.number().required(),
  rewardModel: Joi.string().valid('fixed_rate', 'proportional', 'apr').required(),
  collectionMode: Joi.string().valid('creator_address', 'whitelist', 'both').required(),
  collectionCreator: Joi.string().allow('').default(''),
  whitelistedAsaIds: Joi.array().items(Joi.number()).default([]),
  collectionName: Joi.string().allow('').default(''),
  nftValueInRewardToken: Joi.number().default(0),
  ratePerDay: Joi.number().default(0),
  totalRewardPool: Joi.number().default(0),
  aprRate: Joi.number().default(0),
  valuePerNft: Joi.number().default(0),
  poolEndTime: Joi.number().default(0),
  lockPeriod: Joi.number().default(0),
  depositFeeBps: Joi.number().min(0).max(10000).default(0),
  withdrawFeeBps: Joi.number().min(0).max(10000).default(0),
  claimFeeBps: Joi.number().min(0).max(10000).default(0),
  feeRecipient: Joi.string().allow('').default(''),
});

// NFT stake schema
const nftStakeSchema = Joi.object({
  wallet: Joi.string().required(),
  poolId: Joi.string().required(),
  appId: Joi.number().required(),
  nftAsaId: Joi.number().required(),
  nftName: Joi.string().allow('').default(''),
  nftImageUrl: Joi.string().allow('').default(''),
});

// NFT unstake schema
const nftUnstakeSchema = Joi.object({
  wallet: Joi.string().required(),
  appId: Joi.number().required(),
  nftAsaId: Joi.number().required(),
});

// NFT claim schema
const nftClaimSchema = Joi.object({
  wallet: Joi.string().required(),
  poolId: Joi.string().required(),
  appId: Joi.number().required(),
  rewardClaimed: Joi.number().required(),
  txId: Joi.string().required(),
  feeAmount: Joi.number().default(0),
});

// Alpha Arcade pool creation schema (admin override)
const alphaArcadePoolSchema = Joi.object({
  creatorId: Joi.string().default('system'),
  marketAppId: Joi.number().required(),
  matcherAppId: Joi.number().default(3078581851),
  marketQuestion: Joi.string().allow('').default(''),
  marketCategory: Joi.string().allow('').default(''),
  marketImageUrl: Joi.string().allow('').default(''),
  marketResolutionTime: Joi.number().default(0),
  yesAsaId: Joi.number().default(0),
  noAsaId: Joi.number().default(0),
  usdcAsaId: Joi.number().default(31566704),
  spreadBps: Joi.number().min(0).max(10000).default(50),
  rewardToken: Joi.object({
    id: Joi.string().allow('').default(''),
    name: Joi.string().allow('').default(''),
  }).default({}),
  rewardTokenAmount: Joi.number().default(0),
  poolStartTime: Joi.number().default(0),
  poolEndTime: Joi.number().default(0),
  duration: Joi.number().default(0),
  aprRate: Joi.number().default(0),
  lockPeriod: Joi.number().default(0),
  isActive: Joi.boolean().default(true),
});

// Alpha Arcade pool update schema (partial)
const alphaArcadePoolUpdateSchema = Joi.object({
  spreadBps: Joi.number().min(0).max(10000),
  rewardToken: Joi.object({
    id: Joi.string().allow(''),
    name: Joi.string().allow(''),
  }),
  rewardTokenAmount: Joi.number(),
  poolStartTime: Joi.number(),
  poolEndTime: Joi.number(),
  duration: Joi.number(),
  aprRate: Joi.number(),
  lockPeriod: Joi.number(),
  isActive: Joi.boolean(),
  isResolved: Joi.boolean(),
  resolutionOutcome: Joi.string().valid('yes', 'no', null),
}).min(1);

// Alpha Arcade build deposit schema
const alphaArcadeBuildDepositSchema = Joi.object({
  wallet: Joi.string().required(),
  marketAppId: Joi.number().required(),
  usdcAmount: Joi.number().min(1000000).required(),
  spread: Joi.number().min(0).max(10000).optional(),
});

// Alpha Arcade build withdraw schema
const alphaArcadeBuildWithdrawSchema = Joi.object({
  wallet: Joi.string().required(),
  poolId: Joi.string().required(),
});

// Alpha Arcade record deposit schema
const alphaArcadeRecordDepositSchema = Joi.object({
  wallet: Joi.string().required(),
  marketAppId: Joi.number().required(),
  poolId: Joi.string().required(),
  usdcDeposited: Joi.number().required(),
  yesEscrowAppIds: Joi.array().items(Joi.number()).default([]),
  noEscrowAppIds: Joi.array().items(Joi.number()).default([]),
  spreadUsed: Joi.number().default(0),
  entryMidPrice: Joi.number().default(0),
  txId: Joi.string().required(),
  depositFee: Joi.number().default(0),
});

// Alpha Arcade record withdraw schema
const alphaArcadeRecordWithdrawSchema = Joi.object({
  wallet: Joi.string().required(),
  poolId: Joi.string().optional(),
  positionId: Joi.string().required(),
  usdcRecovered: Joi.number().default(0),
  remainingYesTokens: Joi.number().default(0),
  remainingNoTokens: Joi.number().default(0),
  txId: Joi.string().required(),
  withdrawFee: Joi.number().default(0),
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
  dailyRewardClaimSchema,
  rewardsConfigUpdateSchema,
  adminBanSchema,
  feeConfigUpdateSchema,
  nftStakingPoolSchema,
  nftStakeSchema,
  nftUnstakeSchema,
  nftClaimSchema,
  alphaArcadePoolSchema,
  alphaArcadePoolUpdateSchema,
  alphaArcadeBuildDepositSchema,
  alphaArcadeBuildWithdrawSchema,
  alphaArcadeRecordDepositSchema,
  alphaArcadeRecordWithdrawSchema,
};
