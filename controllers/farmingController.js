const Farming = require("../models/farmingSchema");

// Get all farming data
const getAllFarmingData = async (req, res) => {
  try {
    const { tokenName } = req.query;

    const query = tokenName
      ? { 'rewardToken.name': { $regex: tokenName, $options: 'i' } }
      : {};

    const farmingData = await Farming.find(query);

    res.status(200).json({
      success: true,
      message: farmingData.length === 0
        ? (tokenName ? `No farming data found for token: ${tokenName}` : "No farming data found.")
        : "Farming data fetched successfully.",
      data: farmingData,
    });
  } catch (error) {
    console.error("Error fetching farming data:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching farming data.",
      error: error.message,
    });
  }
};

// Get farming data by creatorId
const getFarmingDataByCreatorId = async (req, res) => {
  const { creatorId } = req.params;
  const { tokenName } = req.query;

  try {
    const query = { creatorId };

    if (tokenName) {
      query['rewardToken.name'] = { $regex: tokenName, $options: 'i' };
    }

    const farmingData = await Farming.find(query);

    res.status(200).json({
      success: true,
      message: farmingData.length === 0
        ? (tokenName ? `No farming data found for token: ${tokenName}` : "No farming data found.")
        : "Farming data fetched successfully.",
      data: farmingData,
    });
  } catch (error) {
    console.error("Error fetching farming data:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching farming data.",
      error: error.message,
    });
  }
};

const getFarmingDataByAppId = async (req, res) => {
  const { appId } = req.params; // Extract appId from route parameters
  const { tokenName } = req.query;

  try {
    // Use appId in the query
    const query = { appId }; // This assumes you have an `appId` field in your Farming model

    // If tokenName is provided, add it as a filter in the query
    if (tokenName) {
      query['rewardToken.name'] = { $regex: tokenName, $options: 'i' };
    }

    // Query the database with the modified query object
    const farmingData = await Farming.find(query);

    res.status(200).json({
      success: true,
      message: farmingData.length === 0
        ? (tokenName ? `No farming data found for token: ${tokenName}` : "No farming data found.")
        : "Farming data fetched successfully.",
      data: farmingData,
    });
  } catch (error) {
    console.error("Error fetching farming data:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching farming data.",
      error: error.message,
    });
  }
};

const getFarmingDataByOnlyAppId = async (req, res) => {
  const { appId } = req.params;

  try {
    const query = { appId };
    const farmingData = await Farming.find(query);

    res.status(200).json({
      success: true,
      message: farmingData.length === 0
        ? "No farming data found for this appId."
        : "Farming data fetched successfully.",
      data: farmingData,
    });
  } catch (error) {
    console.error("Error fetching farming data:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching farming data.",
      error: error.message,
    });
  }
};

// Add farming data
const addFarmingData = async (req, res) => {
  const {
    creatorId,
    lpToken,
    rewardToken,
    rewardTokenAmount,
    farmStartTime,
    farmEndTime,
    duration,
    lockPeriod,
    farmEntryFee,
    rewardDistributionRate,
    rewardDistributionSchedule,
    fryRewardFee,
    aprRate,
    appId,
  } = req.body;

  try {
    const newFarming = new Farming({
      creatorId,
      lpToken,
      rewardToken,
      rewardTokenAmount,
      farmStartTime,
      farmEndTime,
      duration,
      lockPeriod,
      farmEntryFee,
      rewardDistributionRate,
      rewardDistributionSchedule,
      fryRewardFee,
      aprRate,
      appId,
    });

    const savedFarming = await newFarming.save();

    res.status(201).json({
      success: true,
      message: "Farming pool created successfully.",
      data: savedFarming,
    });
  } catch (error) {
    console.error("Error creating farming pool:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while creating the farming pool.",
      error: error.message,
    });
  }
};

// Update farming data by App ID
const updateFarmingData = async (req, res) => {
  const { appId } = req.params;
  const updatedData = req.body;

  try {
    const currentData = await Farming.findOne({ appId });

    if (!currentData) {
      return res.status(404).json({
        success: false,
        message: `Farming data with appId ${appId} not found.`,
      });
    }

    const updated = await Farming.findOneAndUpdate(
      { appId },
      {
        $set: updatedData, // Replace all fields with new data
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Farming data with appId ${appId} updated successfully.`,
      updatedData: updated,
    });
  } catch (error) {
    console.error("Error updating farming data:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while updating farming data.",
      error: error.message,
    });
  }
};


// Delete farming data by ID
const deleteFarmingData = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Farming.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Farming data with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Farming data with ID ${id} deleted successfully.`,
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting farming data:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while deleting farming data.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFarmingData,
  getFarmingDataByCreatorId,
  addFarmingData,
  updateFarmingData,
  deleteFarmingData,
  getFarmingDataByAppId,
  getFarmingDataByOnlyAppId
};
