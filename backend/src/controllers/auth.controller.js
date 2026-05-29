import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { generateTokens, generateOTP } from '../services/auth.service.js';
import { sendMail } from '../config/mail.js';
import jwt from 'jsonwebtoken';

export const registerUser = catchAsync(async (req, res) => {
  const { fullName, email, mobile, password, role } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
  if (existingUser) {
    throw new ApiError(400, 'User with this email or mobile number already exists');
  }

  const { code, expiresAt } = generateOTP();

  const user = new User({
    fullName,
    email,
    mobile,
    password,
    role,
    otp: { code, expiresAt }
  });

  await user.save();

  // Send Registration Verification Email
  await sendMail({
    to: email,
    subject: 'SNS NEST - Verify Your Account',
    html: `<h1>Welcome to SNS NEST</h1><p>Your verification code is: <strong>${code}</strong></p>`
  });

  const userResponse = await User.findById(user._id).select('-password -otp -refreshToken');

  return res
    .status(201)
    .json(new ApiResponse(201, userResponse, 'Registration initiated. OTP code sent to your email.'));
});

export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'Invalid email or password');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens(user);

  user.refreshToken = refreshToken;
  await user.save();

  const isProd = (process.env.NODE_ENV || '').trim() === 'production';
  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  const userResponse = await User.findById(user._id).select('-password -refreshToken -otp');

  let redirectPath = '/client/dashboard';
  if (user.role === 'admin') redirectPath = '/admin/dashboard';

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, { 
      user: userResponse, 
      accessToken, 
      refreshToken, 
      role: user.role, 
      redirectPath 
    }, 'Login successful'));
});

export const verifyOTP = catchAsync(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.otp || user.otp.code !== code || new Date() > user.otp.expiresAt) {
    throw new ApiError(400, 'Invalid or expired OTP code');
  }

  user.isVerified = true;
  user.otp = undefined; // clear otp block
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Account successfully verified!'));
});

export const refreshSessionToken = catchAsync(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Session token missing');
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid or expired session token');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    const isProd = (process.env.NODE_ENV || '').trim() === 'production';
    const options = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken }, 'Token refreshed successfully'));
  } catch (error) {
    throw new ApiError(401, 'Session verification failed');
  }
});

export const logoutUser = catchAsync(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save();
  }

  const isProd = (process.env.NODE_ENV || '').trim() === 'production';
  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getMe = catchAsync(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current user profile fetched successfully'));
});
