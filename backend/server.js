import http from 'http';
import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { configureSocket } from './src/config/socket.js';
import { configureCloudinary } from './src/config/cloudinary.js';

dotenv.config();

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error(`UNCAUGHT EXCEPTION! Shutting down server...`);
  console.error(err.stack || err.message);
  process.exit(1);
});

// Configure services
configureCloudinary();

// Database Connection
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Configure Socket.IO
configureSocket(server);

const runningServer = server.listen(PORT, () => {
  console.log(`[SNS NEST Server]: Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.error(`UNHANDLED PROMISE REJECTION! Shutting down server gracefully...`);
  console.error(err.stack || err.message);
  runningServer.close(() => {
    process.exit(1);
  });
});
