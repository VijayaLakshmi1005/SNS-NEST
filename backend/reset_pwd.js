import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = 'vijayalakshmi200510@gmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      user.password = '123456';
      await user.save();
      console.log(`Password for ${email} reset to '123456'`);
    } else {
      console.log(`User ${email} not found!`);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

runTest();
