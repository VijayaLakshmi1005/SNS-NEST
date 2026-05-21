import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;
const onlineUsers = new Map(); // userId -> socketId

export const configureSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        process.env.CORS_ORIGIN,
        'https://sns-nest.onrender.com'
      ].filter(Boolean),
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    },
  });

  // Socket Auth Middleware
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    // If not in auth or headers, check cookies (since we use httpOnly cookies)
    if (!token && socket.handshake.headers.cookie) {
      const match = socket.handshake.headers.cookie.match(/(?:^| )accessToken=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_123');
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid Token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);
    console.log(`Socket Connected: User ${userId} (${socket.id})`);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // Join Admin room automatically if user is admin
    if (socket.user.role === 'admin' || socket.user.role === 'super_admin') {
      socket.join('admin_dashboard');
      console.log(`Socket ${socket.id} joined admin_dashboard room`);
    }

    socket.on('join:room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Project Module Ecosystem
    socket.on('joinProjectRoom', (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`Socket ${socket.id} joined project room ${projectId}`);
    });

    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', { userId, roomId });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', { userId, roomId });
    });

    // CRM Realtime Interaction Events
    socket.on('admin:send_message', ({ clientId, message }) => {
      // Find client's socket if online
      const clientSocketId = onlineUsers.get(clientId);
      if (clientSocketId) {
        io.to(clientSocketId).emit('client:receive_message', { adminId: userId, message, timestamp: new Date() });
      }
      // Tell other admins that a message was sent so their CRM updates
      socket.to('admin_dashboard').emit('dashboard:user_update', { userId: clientId });
    });

    socket.on('client:send_message', ({ message }) => {
      // Broadcast to all admins
      io.to('admin_dashboard').emit('admin:receive_message', { clientId: userId, message, timestamp: new Date() });
      io.to('admin_dashboard').emit('dashboard:user_update', { userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`Socket Disconnected: User ${userId}`);
      socket.broadcast.emit('user:offline', { userId });
      io.to('admin_dashboard').emit('dashboard:user_update', { userId, status: 'offline' });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const getOnlineUsers = () => onlineUsers;
