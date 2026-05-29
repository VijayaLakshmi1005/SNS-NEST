import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect('mongodb://localhost:27017/sns-nest');
  const userToUpdate = await User.findOne({ email: 'vj@123.com' });
  const adminUser = await User.findOne({ email: 'designer@snsnest.com' }); // It's admin now
  
  if (!userToUpdate || !adminUser) {
    console.log("Users not found");
    process.exit(1);
  }

  try {
    Object.assign(userToUpdate, {
      fullName: 'Vijayalakshmi',
      email: 'vj@123.com',
      mobile: '7204058683',
      role: 'client',
      clientStatus: 'FOLLOW-UP',
      crmTags: ['VIP', 'Requires Follow-up', 'High Budget']
    });
    
    userToUpdate.internalNotes.push({ note: 'Profile updated via CRM', addedBy: adminUser._id });
    await userToUpdate.save();
    console.log("Updated successfully!");
  } catch (err) {
    console.error("Error updating user:", err.message);
  }
  process.exit(0);
}
run();
