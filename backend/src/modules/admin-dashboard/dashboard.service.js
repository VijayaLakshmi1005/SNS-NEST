import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Lead } from '../../models/Lead.js';
import { Payment } from '../../models/Payment.js';
import { Activity } from '../../models/Activity.js';

export class DashboardService {
  static async getOverviewMetrics() {
    const [totalUsers, activeProjects, leads, payments] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Project.countDocuments({ status: { $ne: 'completed' } }),
      Lead.countDocuments({ status: 'New' }),
      Payment.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const revenue = payments.length > 0 ? payments[0].total : 0;

    return {
      totalUsers,
      activeProjects,
      newLeads: leads,
      revenue,
      revenueTrend: '+12.5%',
      usersTrend: '+5.2%',
      projectsTrend: '+2.1%',
      leadsTrend: '+8.4%'
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
          value: { $sum: '$estimatedValue' }
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
    const designers = await User.find({ role: 'designer' }).select('fullName email profileImage').lean();
    // Simulate aggregation of designer stats (in real app, join with projects and reviews)
    return designers.map(d => ({
      ...d,
      activeProjects: Math.floor(Math.random() * 5) + 1,
      completedProjects: Math.floor(Math.random() * 20),
      rating: (Math.random() * (5 - 4) + 4).toFixed(1),
      revenue: Math.floor(Math.random() * 500000) + 100000
    })).sort((a, b) => b.revenue - a.revenue);
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
