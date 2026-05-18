import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss-clean';
import morgan from 'morgan';

// Middleware Imports
import { globalLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import designRoutes from './routes/design.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import estimateRoutes from './routes/estimate.routes.js';
import aiRoutes from './routes/ai.routes.js';
import projectRoutes from './routes/project.routes.js';
import chatRoutes from './routes/chat.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import supportRoutes from './routes/support.routes.js';

const app = express();

// Security HTTP Headers
app.use(helmet());

// Logging Middleware
app.use(morgan('dev'));

// CORS Enablement
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

// Gzip Compression
app.use(compression());

// Global Rate Limiting
app.use('/api', globalLimiter);

// API Routing Mapping
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/estimate', estimateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'SNS NEST - Luxury Interior Design SaaS API is fully online.' });
});

// Final fallback Error Boundaries
app.use(errorHandler);

export default app;
