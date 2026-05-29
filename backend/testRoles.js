import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect('mongodb://localhost:27017/sns-nest');
  const users = await User.find().select('fullName role');
  console.log(users);
  process.exit(0);
}
run();
