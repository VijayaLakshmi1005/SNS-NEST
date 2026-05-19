import http from 'http';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
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

// Self-healing port listener configuration
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Port Clash]: Port ${PORT} is currently in use. Programmatically freeing up the port...`);
    try {
      execSync(`npx kill-port ${PORT}`);
      console.log(`[Port Clash]: Successfully freed port ${PORT}. Retrying listen in 1 second...`);
      setTimeout(() => {
        server.listen(PORT);
      }, 1000);
    } catch (killErr) {
      console.error('[Port Clash Error]: Failed to programmatically kill port:', killErr.message);
      process.exit(1);
    }
  } else {
    console.error('[Server Error]:', err);
    process.exit(1);
  }
});

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

// Graceful shutdown handlers to release ports instantly on nodemon reload
process.on('SIGTERM', () => {
  console.log('[SIGTERM]: Shutting down server gracefully...');
  runningServer.close(() => {
    console.log('[SIGTERM]: Server process terminated.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SIGINT]: Shutting down server gracefully...');
  runningServer.close(() => {
    console.log('[SIGINT]: Server process terminated.');
    process.exit(0);
  });
});
