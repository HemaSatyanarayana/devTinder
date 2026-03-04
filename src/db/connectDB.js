const mongoose = require("mongoose");

require("dotenv").config();

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;

const connectDB = async () => {
  try {
    await mongoose.connect(`${MONGO_CONNECTION_STRING}`);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed. \nError: ");
    throw new Error(error);
  }
};

module.exports = { connectDB };
