import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create user with uppercase
    const email = 'UPPERcaseTest123@example.com';
    const pwd = 'Password123';
    
    // Check if it exists
    await User.deleteOne({ email: email.toLowerCase() });
    
    const user = new User({
      fullName: 'Test User',
      email: email,
      mobile: '9999999991',
      password: pwd,
      role: 'client'
    });
    await user.save();
    
    console.log('Saved email in DB:', user.email);
    
    // Query with exact uppercase
    const found1 = await User.findOne({ email: email });
    console.log('Found with uppercase:', found1 ? 'YES' : 'NO');
    
    // Query with lowercase
    const found2 = await User.findOne({ email: email.toLowerCase() });
    console.log('Found with lowercase:', found2 ? 'YES' : 'NO');
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

runTest();
