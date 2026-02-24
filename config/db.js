const mongoose = require("mongoose");

const db_url = process.env.MONGODB_URI || "mongodb+srv://octalooptech:kiCcXwMkGx7cid3t@frystaking.fw5yv.mongodb.net/";

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(db_url);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  };

  module.exports = connectDB;
