import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const testUserAuth = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://sns-admin:snsnest%40123@cluster0.pwyok.mongodb.net/sns-nest?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to DB');

    // Get the most recently created user
    const db = mongoose.connection.db;
    const users = await db.collection('users').find().sort({ createdAt: -1 }).limit(1).toArray();
    
    if (users.length === 0) {
      console.log('No users found');
      process.exit(0);
    }

    const latestUser = users[0];
    console.log('Latest User:', {
      id: latestUser._id,
      email: latestUser.email,
      fullName: latestUser.fullName,
      passwordHash: latestUser.password, // print hash to see if it's hashed
      createdAt: latestUser.createdAt
    });

  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};

testUserAuth();
