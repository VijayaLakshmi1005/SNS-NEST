import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: (req, res) => {
    // Safely skip all rate limits on local developer machines
    const env = (process.env.NODE_ENV || '').trim();
    return env === 'development' || env === '';
  },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    data: null,
    error: { statusCode: 429 }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: (req, res) => {
    // Safely skip auth rate limits on local developer machines
    const env = (process.env.NODE_ENV || '').trim();
    return env === 'development' || env === '';
  },
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    data: null,
    error: { statusCode: 429 }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
