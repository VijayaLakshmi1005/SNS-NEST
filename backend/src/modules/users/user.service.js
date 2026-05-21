import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Payment } from '../../models/Payment.js';
import { Lead } from '../../models/Lead.js';
import { SupportTicket } from '../../models/SupportTicket.js';
import { Activity } from '../../models/Activity.js';
import { ApiError } from '../../utils/ApiError.js';

export class UserService {
  static async getPaginatedUsers({ page = 1, limit = 10, search = '', role, status, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const skip = (page - 1) * limit;

    const matchStage = {};
    if (search) {
      matchStage.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) matchStage.role = role;
    if (status) {
      if (status === 'verified') matchStage.isVerified = true;
      if (status === 'unverified') matchStage.isVerified = false;
      if (status === 'blocked') matchStage.isBlocked = true;
    }

    const sortStage = {};
    sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: matchStage },
      // Lookup active projects for this user
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'client',
          as: 'projects'
        }
      },
      // Calculate derived fields
      {
        $addFields: {
          activeProjectCount: {
            $size: {
              $filter: {
                input: '$projects',
                as: 'project',
                cond: { $ne: ['$$project.status', 'completed'] }
              }
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          projects: 0 // hide raw projects from table view
        }
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    const [users, totalCount] = await Promise.all([
      User.aggregate(pipeline),
      User.countDocuments(matchStage)
    ]);

    return {
      users,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        pages: Math.ceil(totalCount / limit)
      }
    };
  }

  static async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password -refreshToken').lean();
    if (!user) throw new ApiError(404, 'User not found');

    const [projects, payments, tickets, activities] = await Promise.all([
      Project.find({ client: userId }).populate('assignedDesigner', 'fullName profileImage').lean(),
      Payment.find({ client: userId }).sort({ createdAt: -1 }).lean(),
      SupportTicket.find({ client: userId }).sort({ createdAt: -1 }).lean(),
      Activity.find({ referenceId: userId }).sort({ createdAt: -1 }).limit(20).lean()
    ]);

    return {
      ...user,
      projects,
      payments,
      tickets,
      activities,
      totalSpent: payments.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0)
    };
  }

  static async toggleBlockStatus(userId, blockReason, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    
    user.isBlocked = !user.isBlocked;
    
    if (user.isBlocked) {
      user.internalNotes.push({
        note: `Blocked: ${blockReason || 'No reason provided'}`,
        addedBy: adminId
      });
    }

    await user.save();
    return user;
  }

  static async addInternalNote(userId, note, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.internalNotes.push({ note, addedBy: adminId });
    await user.save();
    return user.internalNotes;
  }
}
