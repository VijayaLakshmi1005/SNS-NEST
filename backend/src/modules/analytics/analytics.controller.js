import mongoose from 'mongoose';
import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Lead } from '../../models/Lead.js';
import { Invoice, Expense, FinancePayment, Commission, ActivityLog as FinanceActivityLog } from '../finance/finance.model.js';
import { Appointment } from '../appointments/appointment.model.js';
import { ROLES } from '../../constants/roles.js';
import { Activity } from '../../models/Activity.js';

// Helper to get month boundaries
const getMonthRange = (monthsAgo = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const getDashboardKPIs = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { start: currentMonthStart, end: currentMonthEnd } = getMonthRange(0);
    const { start: lastMonthStart, end: lastMonthEnd } = getMonthRange(1);

    // Revenue KPIs
    const paidInvoices = await Invoice.find({ status: { $in: ['Paid', 'Partial'] } });
    const totalRevenue = paidInvoices.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
    
    const currentMonthRevenue = paidInvoices
      .filter(i => new Date(i.updatedAt) >= currentMonthStart && new Date(i.updatedAt) <= currentMonthEnd)
      .reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);

    const lastMonthRevenue = paidInvoices
      .filter(i => new Date(i.updatedAt) >= lastMonthStart && new Date(i.updatedAt) <= lastMonthEnd)
      .reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
      
    const todayRevenue = paidInvoices
      .filter(i => new Date(i.updatedAt) >= today)
      .reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);

    // Leads KPIs
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const convertedLeads = await Lead.countDocuments({ status: 'Converted' });
    const lostLeads = await Lead.countDocuments({ status: 'Closed' });

    // Projects KPIs
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: { $in: ['Planning', 'Design', 'Execution', 'In Progress'] } });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });

    // Appointments/Consultations
    const todayConsultations = await Appointment.countDocuments({ date: { $gte: today } });
    const upcomingConsultations = await Appointment.countDocuments({ date: { $gte: new Date() }, status: { $ne: 'Cancelled' } });
    
    // Users (Clients & Designers)
    const totalClients = await User.countDocuments({ role: ROLES.CLIENT });
    const activeClients = await User.countDocuments({ role: ROLES.CLIENT, clientStatus: 'Active Client' });
    const totalDesigners = await User.countDocuments({ $or: [{ role: { $in: [ROLES.DESIGNER, ROLES.SENIOR_DESIGNER] } }, { isDesigner: true }] });

    res.json({
      success: true,
      data: {
        revenue: { total: totalRevenue, currentMonth: currentMonthRevenue, lastMonth: lastMonthRevenue, today: todayRevenue },
        leads: { total: totalLeads, new: newLeads, converted: convertedLeads, lost: lostLeads },
        projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
        consultations: { today: todayConsultations, upcoming: upcomingConsultations },
        users: { clients: totalClients, activeClients, designers: totalDesigners }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const invoices = await Invoice.find({ status: { $in: ['Paid', 'Partial'] } });
    
    const chartDataMap = {};
    for (let i = 5; i >= 0; i--) {
       const d = new Date();
       d.setMonth(d.getMonth() - i);
       const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' });
       chartDataMap[monthKey] = { name: monthKey.split(' ')[0], revenue: 0, yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
    }

    invoices.forEach(inv => {
       const d = new Date(inv.updatedAt);
       if (!isNaN(d)) {
           const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' });
           if (chartDataMap[monthKey]) {
               chartDataMap[monthKey].revenue += (inv.amountPaid || 0);
           }
       }
    });

    const monthlyTrend = Object.values(chartDataMap).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

    res.json({
      success: true,
      data: { monthlyTrend }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeadAnalytics = async (req, res) => {
  try {
    const leads = await Lead.find();
    const funnel = {
      new: leads.filter(l => l.status === 'New').length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      interested: leads.filter(l => l.status === 'Interested').length,
      scheduled: leads.filter(l => l.status === 'Consultation Scheduled').length,
      converted: leads.filter(l => l.status === 'Converted').length,
    };

    const total = leads.length;
    const winRate = total > 0 ? ((funnel.converted / total) * 100).toFixed(1) : 0;

    res.json({ success: true, data: { funnel, winRate, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectAnalytics = async (req, res) => {
  try {
    const projects = await Project.find().populate('assignedDesigner', 'fullName profileImage');
    const statusCounts = {
      planning: projects.filter(p => ['Planning', 'In Progress'].includes(p.status)).length,
      design: projects.filter(p => p.status === 'Design').length,
      execution: projects.filter(p => p.status === 'Execution').length,
      completed: projects.filter(p => p.status === 'Completed').length,
    };
    
    // Designer Workload
    const workloadMap = {};
    projects.forEach(p => {
      if (p.assignedDesigner && !['Completed', 'Cancelled'].includes(p.status)) {
         const dId = p.assignedDesigner._id.toString();
         if (!workloadMap[dId]) {
           workloadMap[dId] = { designer: p.assignedDesigner.fullName, count: 0 };
         }
         workloadMap[dId].count += 1;
      }
    });

    res.json({ success: true, data: { statusCounts, workload: Object.values(workloadMap) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDesignerLeaderboard = async (req, res) => {
  try {
    const designers = await User.find({ $or: [{ role: { $in: [ROLES.DESIGNER, ROLES.SENIOR_DESIGNER] } }, { isDesigner: true }] }).select('fullName profileImage totalRevenue clientHealthScore');
    
    // Sort by revenue
    const leaderboard = designers.map(d => ({
      _id: d._id,
      name: d.fullName,
      avatar: d.profileImage,
      revenue: d.totalRevenue || 0,
      score: d.clientHealthScore || 100
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityFeed = async (req, res) => {
  try {
    const feed = await Activity.find().sort({ createdAt: -1 }).limit(30);
    const mappedFeed = feed.map(f => ({
      _id: f._id,
      title: f.title,
      description: f.description,
      timestamp: f.createdAt
    }));
    res.json({ success: true, data: mappedFeed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
