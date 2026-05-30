import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find().toArray();
    console.log('Users in local DB:');
    users.forEach(u => console.log(`${u.email} - role: ${u.role}`));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

checkDB();
