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
import aiRoutes from './modules/ai-visualizer/ai.routes.js';
import projectRoutes from './routes/project.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import supportRoutes from './routes/support.routes.js';
import designerRoutes from './modules/designers/designer.routes.js';
import consultationRoutes from './modules/consultations/consultation.routes.js';
import estimatorRoutes from './modules/estimator/estimator.routes.js';
import trackingRoutes from './modules/project-tracking/tracking.routes.js';

// Express 5 query getter compatibility workaround for legacy middlewares (like xss-clean, express-mongo-sanitize)
const queryDescriptor = Object.getOwnPropertyDescriptor(express.request, 'query');
if (queryDescriptor && queryDescriptor.get && !queryDescriptor.set) {
  const originalGet = queryDescriptor.get;
  Object.defineProperty(express.request, 'query', {
    get() {
      return this._sanitizedQuery !== undefined ? this._sanitizedQuery : originalGet.call(this);
    },
    set(value) {
      this._sanitizedQuery = value;
    },
    configurable: true,
    enumerable: true
  });
}

const app = express();

// Security HTTP Headers
app.use(helmet());

// Logging Middleware
// app.use(morgan('dev'));

// CORS Enablement
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Express 5 query getter workaround for express-mongo-sanitize
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true
  });
  next();
});

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

// Mounting modular real-time project tracking BEFORE legacy routes to cascade smoothly
app.use('/api/projects', trackingRoutes);
app.use('/api/projects', projectRoutes);

app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/designers', designerRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/estimator', estimatorRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'SNS NEST - Luxury Interior Design SaaS API is fully online.' });
});

// Final fallback Error Boundaries
app.use(errorHandler);

// Trigger nodemon restart

export default app;
