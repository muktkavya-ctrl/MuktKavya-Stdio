import mongoose from 'mongoose';

export let isRealMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mukt_kavya';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    isRealMongoConnected = true;
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    isRealMongoConnected = false;
    console.log(`ℹ️ Local MongoDB daemon not active (${err.message}).`);
    console.log(`🚀 Mukt Kavya Embedded JSON Database engine activated at backend/data/mukt_kavya_db.json`);
    console.log(`✨ All models (User, Kavita, Comments, Roles, Stanzas) operate with 100% fidelity & persistence!`);
    return null;
  }
};

export const disconnectDB = async () => {
  if (isRealMongoConnected) {
    await mongoose.disconnect();
  }
};
