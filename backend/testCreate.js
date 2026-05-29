import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserService } from './src/modules/users/user.service.js';

dotenv.config();

async function run() {
  await mongoose.connect('mongodb://localhost:27017/sns-nest');
  try {
    const user = await UserService.createUser({
      fullName: 'Vijaya Lakshmi S',
      email: 'vijayalakshmi200510@gmail.com',
      mobile: '+917204058683',
      password: 'password123',
      role: 'admin',
      clientStatus: 'New Lead',
      crmTags: []
    }, new mongoose.Types.ObjectId());
    console.log('Success:', user);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
