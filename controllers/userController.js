const { uploadToS3 } = require("../config/s3");
const User = require("../models/userSchema");

const mime = require("mime-types"); 

// Create or Update User based on walletId, uploading images to S3
const createOrUpdateUser = async (req, res) => {
  const { walletId, name, bio } = req.body;

  if (!walletId) {
    return res.status(400).json({ success: false, message: "walletId is required." });
  }

  try {
    // Prepare image uploads if provided via multipart/form-data
    const bucket = process.env.S3_BUCKET_NAME;
    let profilePictureUrl;
    let bannerUrl;

    const files = req.files || {};
    const profileFile = Array.isArray(files.profilePicture) ? files.profilePicture[0] : undefined;
    const bannerFile = Array.isArray(files.banner) ? files.banner[0] : undefined;

    // Helper to build a unique key
    const buildKey = (kind, file) => {
      const ext = mime.extension(file.mimetype) || "bin";
      return `users/${walletId}/${kind}_${Date.now()}.${ext}`;
    };

    if (profileFile) {
      profilePictureUrl = await uploadToS3({
        bucket,
        key: buildKey("profilePicture", profileFile),
        buffer: profileFile.buffer,
        contentType: profileFile.mimetype,
      });
    }

    if (bannerFile) {
      bannerUrl = await uploadToS3({
        bucket,
        key: buildKey("banner", bannerFile),
        buffer: bannerFile.buffer,
        contentType: bannerFile.mimetype,
      });
    }

    // Decide create vs update
    const existing = await User.findOne({ walletId });

    // Build update doc only with provided fields
    const updateDoc = {};
    if (typeof name === "string" && name.trim()) updateDoc.name = name.trim();
    if (typeof bio !== "undefined") updateDoc.bio = bio;
    if (profilePictureUrl) updateDoc.profilePicture = profilePictureUrl;
    if (bannerUrl) updateDoc.banner = bannerUrl;

    if (existing) {
      const updated = await User.findOneAndUpdate(
        { walletId },
        { $set: updateDoc },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        success: true,
        message: "User updated successfully.",
        data: updated,
      });
    } else {
      if (!updateDoc.name) {
        return res.status(400).json({
          success: false,
          message: "name is required when creating a new user.",
        });
      }
      const created = await User.create({
        walletId,
        name: updateDoc.name,
        bio: typeof updateDoc.bio !== "undefined" ? updateDoc.bio : undefined,
        profilePicture: updateDoc.profilePicture,
        banner: updateDoc.banner,
      });
      return res.status(201).json({
        success: true,
        message: "User created successfully.",
        data: created,
      });
    }
  } catch (error) {
    console.error("Error creating or updating user:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating or updating the user.",
      error: error.message,
    });
  }
};

// Get User by walletId
const getUserByWalletId = async (req, res) => {
  const { walletId } = req.params;

  if (!walletId) {
    return res.status(400).json({ success: false, message: "walletId is required." });
  }

  try {
    const user = await User.findOne({ walletId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No user found with walletId: ${walletId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrUpdateUser,
  getUserByWalletId,
};