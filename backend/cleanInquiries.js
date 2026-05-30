import mongoose from 'mongoose';
mongoose.connect('mongodb://127.0.0.1:27017/sns-nest').then(async () => {
  try {
    const inquiries = await mongoose.connection.db.collection('inquiries').find().toArray();
    console.log(JSON.stringify(inquiries.map(i => ({ _id: i._id, status: i.status })), null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});
