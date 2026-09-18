const mongoose = require('mongoose');

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      // Auto-cleanup legacy duplicate indexes if any
      try {
        const User = require('../models/User');
        await User.collection.dropIndex('firebaseUid_1').catch(() => {});
        await User.syncIndexes();
        console.log('MongoDB Indexes Synchronized (sparse firebaseUid index active)');
      } catch (idxErr) {
        // Silently continue if index already dropped
      }
      return;
    } catch (error) {
      console.error(`MongoDB Connection Attempt ${retries + 1} Error: ${error.message}`);
      retries += 1;
      if (retries < MAX_RETRIES) {
        console.log(`Retrying MongoDB connection in 3s... (${retries}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  console.warn('⚠️ Warning: MongoDB connection failed after retries. Backend will run in demo/offline DB mode.');
};

module.exports = connectDB;
