const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Timeout quickly (2 seconds) if MongoDB is not running
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcare', {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.isDbMock = false;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.log(`\n======================================================`);
    console.log(`⚠️  [WARNING] LOCAL MONGODB DAEMON IS NOT RUNNING.`);
    console.log(`⚠️  SYSTEM IS FALLING BACK TO IN-MEMORY DATABASE MODE.`);
    console.log(`⚠️  All items, carts, orders, and reminders will persist in-memory.`);
    console.log(`======================================================\n`);
    global.isDbMock = true;
  }
};

module.exports = connectDB;

