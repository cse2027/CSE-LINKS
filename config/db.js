const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[MongoDB Atlas] Connected successfully to database: "${conn.connection.name}" at host: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Atlas Notice] DB Connection attempt failed: ${error.message}`);
    console.warn(`[MongoDB Atlas Notice] Server running with local JSON storage fallback. All submissions will be preserved.`);
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
