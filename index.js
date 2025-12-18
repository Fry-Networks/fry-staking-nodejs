require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const swapHistoryRoute = require("./routes/UserSwapHistoryRoute");
const stakerDataRoute = require("./routes/stackerDataRoute");
const yieldFarmingRoute = require("./routes/yeildFarmingRoute");
const stakingRoute = require("./routes/stackingRoute");
const stakingTokenRoutes = require('./routes/stackingTokenRoute');
const TokenRoute = require("./routes/tokenRoute");
const withdrawRoutes = require("./routes/withdrawRoutes");
const claimRewardRoute = require("./routes/claimRewardRoute");
const farmingRoute = require("./routes/farmingRoute");
const stackingFarmingTokenRoute = require("./routes/stackingFarmingTokenRoute");
const farmingWithdrawRoutes = require("./routes/farmingWithdrawRoutes");
const claimFarmRewardRoutes = require('./routes/claimFarmRewardRoutes');
const userRoutes = require("./routes/userRoutes");
const gasFeeRoutes = require('./routes/gasFeeRoutes');

const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require("./config/db");
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'cache-control', 'Authorization'],
  credentials: true,
}));

app.use("/swaphistory", swapHistoryRoute);
app.use("/stakerdata", stakerDataRoute);
app.use("/yieldfarming", yieldFarmingRoute);
app.use("/staking", stakingRoute);
app.use("/token", TokenRoute);
app.use('/stakingtoken', stakingTokenRoutes);
app.use("/withdraw", withdrawRoutes);
app.use("/claimreward", claimRewardRoute);
app.use("/farming", farmingRoute);
app.use("/stakingfarmingtoken", stackingFarmingTokenRoute);
app.use("/farmingwithdraw", farmingWithdrawRoutes);
app.use('/claimfarmrewards', claimFarmRewardRoutes);
app.use('/gasfee', gasFeeRoutes);
app.use("/user", userRoutes);
// Connect to MongoDB
connectDB();

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});