import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';
import { ROLES } from './src/constants/roles.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const seedAuth = async () => {
  try {
    await connectDB();

    // Clear old test accounts
    await User.deleteMany({ email: { $in: ['admin@snsnest.com', 'designer@snsnest.com', 'client@snsnest.com'] } });
    console.log('Cleared old test accounts.');

    // Check for Admin
    const adminExists = await User.findOne({ email: 'admin@snsnest.com' });
    if (!adminExists) {
      await User.create({
        fullName: 'System Admin',
        email: 'admin@snsnest.com',
        mobile: '1000000000',
        password: 'Admin@123',
        role: ROLES.ADMIN,
        isVerified: true,
      });
      console.log('Admin account seeded: admin@snsnest.com / Admin@123');
    } else {
      console.log('Admin account already exists.');
    }

    // Check for Designer
    const designerExists = await User.findOne({ email: 'designer@snsnest.com' });
    if (!designerExists) {
      await User.create({
        fullName: 'Lead Designer',
        email: 'designer@snsnest.com',
        mobile: '2000000000',
        password: 'Designer@123',
        role: ROLES.DESIGNER,
        isVerified: true,
      });
      console.log('Designer account seeded: designer@snsnest.com / Designer@123');
    } else {
      console.log('Designer account already exists.');
    }

    // Check for Client
    const clientExists = await User.findOne({ email: 'client@snsnest.com' });
    if (!clientExists) {
      await User.create({
        fullName: 'Premium Client',
        email: 'client@snsnest.com',
        mobile: '3000000000',
        password: 'Client@123',
        role: ROLES.CLIENT,
        isVerified: true,
      });
      console.log('Client account seeded: client@snsnest.com / Client@123');
    } else {
      console.log('Client account already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAuth();
