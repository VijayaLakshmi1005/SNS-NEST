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

    const matchStage = { isArchived: { $ne: true } }; // Hide archived users by default
    if (search) {
      matchStage.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) matchStage.role = role;
    if (status) {
      if (status === 'verified') matchStage.isVerified = true;
      if (status === 'unverified') matchStage.isVerified = false;
      if (status === 'blocked') matchStage.isBlocked = true;
      if (status === 'archived') matchStage.isArchived = true;
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
      // Lookup assigned designer
      {
        $lookup: {
          from: 'users',
          localField: 'assignedDesigner',
          foreignField: '_id',
          as: 'assignedDesignerDoc'
        }
      },
      {
        $unwind: { path: '$assignedDesignerDoc', preserveNullAndEmptyArrays: true }
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
          },
          assignedDesignerName: '$assignedDesignerDoc.fullName'
        }
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          projects: 0,
          assignedDesignerDoc: 0
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

  static async getDashboardKPIs() {
    const [totalUsers, activeUsers, verifiedUsers, blockedUsers] = await Promise.all([
      User.countDocuments({ isArchived: { $ne: true }, role: 'client' }),
      User.countDocuments({ isArchived: { $ne: true }, role: 'client', lastActivityAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ isArchived: { $ne: true }, role: 'client', isVerified: true }),
      User.countDocuments({ isArchived: { $ne: true }, role: 'client', isBlocked: true })
    ]);
    return { totalUsers, activeUsers, verifiedUsers, blockedUsers };
  }

  static async createUser(userData, adminId) {
    const user = new User({ ...userData });
    user.internalNotes.push({ note: 'User created via Admin CRM', addedBy: adminId });
    await user.save();
    
    // Emit socket event (to be handled by global socket instance if available)
    global.io?.emit('user:created', user);
    return user;
  }

  static async updateUser(userId, updateData, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    Object.assign(user, updateData);
    user.internalNotes.push({ note: 'Profile updated via CRM', addedBy: adminId });
    await user.save();

    global.io?.emit('user:updated', user);
    return user;
  }

  static async softDeleteUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.isArchived = true;
    user.internalNotes.push({ note: 'User archived (soft deleted)', addedBy: adminId });
    await user.save();

    global.io?.emit('user:deleted', { _id: user._id });
    return user;
  }

  static async verifyUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.isVerified = true;
    user.internalNotes.push({ note: 'User manually verified', addedBy: adminId });
    await user.save();

    global.io?.emit('user:verified', user);
    return user;
  }

  static async assignDesigner(userId, designerId, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.assignedDesigner = designerId;
    user.internalNotes.push({ note: `Designer assigned`, addedBy: adminId });
    await user.save();

    global.io?.emit('designer:assigned', { userId: user._id, designerId });
    return user;
  }

  static async getUserProfile(userId) {
    const user = await User.findById(userId).populate('assignedDesigner', 'fullName profileImage').select('-password -refreshToken').lean();
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
      global.io?.emit('user:blocked', user);
    } else {
      user.internalNotes.push({
        note: `Unblocked by Admin`,
        addedBy: adminId
      });
      global.io?.emit('user:unblocked', user);
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
