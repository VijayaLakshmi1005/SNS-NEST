import { catchAsync } from '../../utils/catchAsync.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { UserService } from './user.service.js';

export const getUsers = catchAsync(async (req, res) => {
  const result = await UserService.getPaginatedUsers(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Users fetched successfully'));
});

export const getUserProfile = catchAsync(async (req, res) => {
  const profile = await UserService.getUserProfile(req.params.id);
  res.status(200).json(new ApiResponse(200, profile, 'User profile fetched successfully'));
});

export const toggleBlockUser = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const user = await UserService.toggleBlockStatus(req.params.id, reason, req.user._id);
  const statusMsg = user.isBlocked ? 'blocked' : 'unblocked';
  res.status(200).json(new ApiResponse(200, user, `User successfully ${statusMsg}`));
});

export const addInternalNote = catchAsync(async (req, res) => {
  const { note } = req.body;
  const notes = await UserService.addInternalNote(req.params.id, note, req.user._id);
  res.status(201).json(new ApiResponse(201, notes, 'Internal note added successfully'));
});
