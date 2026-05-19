import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { Designer } from '../modules/designers/designer.model.js';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is undefined. Please ensure MONGO_URI is set in your Render dashboard Environment Variables.');
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default user and project
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // 1. Seed Client
    let client = await User.findOne({ $or: [{ email: 'vj@123.com' }, { mobile: '7204058683' }] });
    if (!client) {
      client = new User({
        fullName: 'Vijayalakshmi',
        email: 'vj@123.com',
        mobile: '7204058683',
        password: 'vj1234',
        role: 'client',
        isVerified: true
      });
      await client.save();
      console.log('Seeded default client (vj@123.com) successfully!');
    } else {
      client.email = 'vj@123.com';
      client.password = 'vj1234';
      await client.save();
      console.log('Updated existing client user details successfully!');
    }

    // 2. Seed Designer
    let designer = await User.findOne({ $or: [{ email: 'designer@snsnest.com' }, { mobile: '9876543210' }] });
    if (!designer) {
      designer = new User({
        fullName: 'John Designer',
        email: 'designer@snsnest.com',
        mobile: '9876543210',
        password: 'designer123',
        role: 'designer',
        isVerified: true
      });
      await designer.save();
      console.log('Seeded default designer successfully!');
    } else {
      designer.email = 'designer@snsnest.com';
      await designer.save();
      console.log('Updated existing designer user details successfully!');
    }

    // 3. Seed Project
    const projectCount = await Project.countDocuments({ client: client._id });
    if (projectCount === 0) {
      const project = new Project({
        title: 'Scandinavian Villa',
        client: client._id,
        designer: designer._id,
        budget: 2940000,
        status: 'Material Procurement',
        timeline: [
          { status: 'Consultation Completed', completed: true },
          { status: 'Design Approved', completed: true },
          { status: 'Material Procurement', completed: true },
          { status: 'Execution Started', completed: false },
          { status: 'Final Delivery', completed: false }
        ]
      });
      await project.save();
      console.log('Seeded default project for client (vj@123.com) successfully!');
    }

    // 4. Seed Booking (Meeting)
    const bookingCount = await Booking.countDocuments({ client: client._id });
    if (bookingCount === 0) {
      const meetingTime = new Date();
      meetingTime.setDate(meetingTime.getDate() + 2); // 2 days from now
      meetingTime.setHours(10, 0, 0, 0); // 10:00 AM

      const booking = new Booking({
        client: client._id,
        designer: designer._id,
        dateTime: meetingTime,
        type: 'Video',
        status: 'Scheduled',
        roomType: 'Living Room & Kitchen',
        notes: 'Discuss layout options and marble selection.'
      });
      await booking.save();
      console.log('Seeded default booking successfully!');
    }

    // 5. Seed Payments
    const paymentCount = await Payment.countDocuments({ client: client._id });
    if (paymentCount === 0) {
      // Seed a paid payment
      const p1 = new Payment({
        client: client._id,
        orderId: 'order_mock_1',
        paymentId: 'pay_mock_1',
        amount: 980000,
        status: 'Paid',
        milestoneName: 'Design Approved',
        currency: 'INR'
      });
      await p1.save();

      // Seed a pending payment
      const p2 = new Payment({
        client: client._id,
        orderId: 'order_mock_2',
        amount: 980000,
        status: 'Created',
        milestoneName: 'Material Procurement',
        currency: 'INR'
      });
      await p2.save();
      console.log('Seeded default payments successfully!');
    }

    // 6. Seed Notifications
    const notificationCount = await Notification.countDocuments({ recipient: client._id });
    if (notificationCount === 0) {
      await Notification.insertMany([
        {
          recipient: client._id,
          type: 'project',
          title: 'Material Procurement Started',
          message: 'Your Scandinavian Villa project has entered the material procurement phase.',
          isRead: false
        },
        {
          recipient: client._id,
          type: 'payment',
          title: 'Invoice Generated',
          message: 'An invoice for the Material Procurement milestone (₹9,80,000) has been generated.',
          isRead: false
        },
        {
          recipient: client._id,
          type: 'consultation',
          title: 'Meeting Scheduled',
          message: 'A video consultation has been scheduled with John Designer for Living Room & Kitchen.',
          isRead: false
        }
      ]);
      console.log('Seeded default notifications successfully!');
    }

    // 7. Seed Designers
    const designerCount = await Designer.countDocuments({});
    if (designerCount === 0) {
      const defaultSlots = ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      const availability = weekDays.map(day => ({
        day,
        slots: defaultSlots
      }));

      await Designer.insertMany([
        {
          name: 'Sreenivasulu',
          email: 'sreeni@snsnest.com',
          specialization: 'Scandinavian Minimalist Architect',
          experience: 12,
          bio: 'Specializing in raw materials, neutral tones, and light-filled Scandinavian spaces that balance warmth and minimalism.',
          rating: 4.9,
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400',
          consultationTypes: ['Video Call', 'Offline Meeting'],
          availability
        },
        {
          name: 'Narendra',
          email: 'narendra@snsnest.com',
          specialization: 'Luxury Penthouse Designer',
          experience: 10,
          bio: 'Pioneering ultra-luxury interior experiences using premium marble, custom furniture, and bespoke ambient lighting setups.',
          rating: 4.8,
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400',
          consultationTypes: ['Video Call', 'Offline Meeting'],
          availability
        },
        {
          name: 'Sendil',
          email: 'sendil@snsnest.com',
          specialization: 'Mid-Century Modern Specialist',
          experience: 8,
          bio: 'Blending functional 20th-century classics with modern eco-friendly materials, organic shapes, and indoor-outdoor layouts.',
          rating: 4.7,
          profileImage: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=400&h=400',
          consultationTypes: ['Video Call'],
          availability: availability.filter(av => ['Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(av.day))
        }
      ]);
      console.log('Seeded 3 default designers successfully!');
    }
  } catch (err) {
    console.error('Database seeding error:', err.message);
  }
};

