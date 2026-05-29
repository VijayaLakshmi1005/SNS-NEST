import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';
import { Project } from './src/models/Project.js';
import { Lead } from './src/models/Lead.js';
import { Payment } from './src/models/Payment.js';
import { Activity } from './src/models/Activity.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const seedAdminData = async () => {
  try {
    await connectDB();

    console.log('Clearing old real-time tracking data...');
    await Lead.deleteMany();
    await Payment.deleteMany();
    await Activity.deleteMany();
    
    // Fetch some users
    const clients = await User.find({ role: 'client' });
    const designers = await User.find({ role: 'designer' });

    if (clients.length === 0 || designers.length === 0) {
      console.log('Please run auth.seed.js first to create users!');
      process.exit(1);
    }

    console.log('Seeding Leads...');
    const leads = await Lead.insertMany([
      { name: 'Victoria Chase', source: 'Website', status: 'New', estimatedValue: 50000 },
      { name: 'Jonathan Pierce', source: 'AI Visualizer', status: 'Consultation Scheduled', estimatedValue: 150000, assignedTo: designers[0]._id },
      { name: 'Maya Lin', source: 'Referral', status: 'Interested', estimatedValue: 75000 }
    ]);

    console.log('Seeding Payments (historical 6 months)...');
    const paymentDocs = [];
    for (let i = 0; i < 20; i++) {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 180));
      paymentDocs.push({
        client: clients[0]._id,
        amount: Math.floor(Math.random() * 20000) + 5000,
        currency: 'INR',
        status: 'Paid',
        orderId: `ORDER_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        milestoneName: 'Design Consultation Retainer',
        createdAt: d
      });
    }
    await Payment.insertMany(paymentDocs);

    console.log('Seeding Activities...');
    await Activity.insertMany([
      { title: 'New Lead Registered', description: 'Victoria Chase signed up.', type: 'user_registered' },
      { title: 'Payment Received', description: '₹12,500 received for Project X.', type: 'payment_received' },
      { title: 'Consultation Scheduled', description: 'Jonathan Pierce scheduled with Sophia.', type: 'system' }
    ]);

    console.log('Real-time Admin Data successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error with seeder', error);
    process.exit(1);
  }
};

seedAdminData();
