import { User } from '../../models/User.js';
import { ProjectModular as Project } from '../projects/project.model.js';
import { LeadModular as Lead } from '../leads/lead.model.js';
import { Payment } from '../../models/Payment.js';
import { Activity } from '../../models/Activity.js';

export class DashboardService {
  static async getOverviewMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, activeProjects, leads, payments, recentUsers, recentProjects, recentLeads, recentPayments] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Project.countDocuments({ status: { $ne: 'Completed' } }),
      Lead.countDocuments({ status: 'New Lead' }),
      Payment.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      User.countDocuments({ role: 'client', createdAt: { $gte: thirtyDaysAgo } }),
      Project.countDocuments({ status: { $ne: 'Completed' }, createdAt: { $gte: thirtyDaysAgo } }),
      Lead.countDocuments({ status: 'New Lead', createdAt: { $gte: thirtyDaysAgo } }),
      Payment.aggregate([
        { $match: { status: 'Paid', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const revenue = payments.length > 0 ? payments[0].total : 0;
    const recentRevenue = recentPayments.length > 0 ? recentPayments[0].total : 0;

    const calcTrend = (recent, total) => total > 0 ? `+${((recent / total) * 100).toFixed(1)}%` : '0%';

    return {
      totalUsers,
      activeProjects,
      newLeads: leads,
      revenue,
      revenueTrend: calcTrend(recentRevenue, revenue),
      usersTrend: calcTrend(recentUsers, totalUsers),
      projectsTrend: calcTrend(recentProjects, activeProjects),
      leadsTrend: calcTrend(recentLeads, leads)
    };
  }

  static async getRevenueAnalytics() {
    // Aggregating revenue over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const payments = await Payment.aggregate([
      {
        $match: {
          status: 'Paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Fill in blanks for the last 6 months
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      
      const found = payments.find(p => p._id.year === year && p._id.month === monthIndex + 1);
      
      chartData.push({
        name: monthNames[monthIndex],
        revenue: found ? found.revenue : 0
      });
    }

    return chartData;
  }

  static async getLeadAnalytics() {
    const leads = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          value: { $sum: '$budget' }
        }
      }
    ]);
    return leads;
  }

  static async getProjectDistribution() {
    const projects = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    return projects;
  }

  static async getTopDesigners() {
    const designers = await User.find({ $or: [{ role: { $in: ['designer', 'senior_designer'] } }, { isDesigner: true }] }).select('fullName email profileImage').lean();
    
    const designerStats = await Promise.all(designers.map(async (d) => {
      const activeProjects = await Project.countDocuments({ designer: d._id, status: { $ne: 'Completed' } });
      const completedProjects = await Project.countDocuments({ designer: d._id, status: 'Completed' });
      
      const projects = await Project.find({ designer: d._id }).select('budget');
      const revenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
      
      return {
        ...d,
        activeProjects,
        completedProjects,
        revenue
      };
    }));

    return designerStats.sort((a, b) => b.revenue - a.revenue);
  }

  static async getRecentPayments() {
    return await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'fullName email')
      .populate('project', 'title');
  }

  static async getActivities() {
    return await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);
  }
}
