import { catchAsync } from '../../utils/catchAsync.js';
import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { SupportTicket } from '../../models/SupportTicket.js';

export const globalSearch = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(200).json({ success: true, data: [] });

  const regex = new RegExp(q, 'i');

  const [users, projects, tickets] = await Promise.all([
    User.find({
      $or: [{ fullName: regex }, { email: regex }, { phone: regex }]
    }).limit(5).select('fullName email role'),
    
    Project.find({
      $or: [{ name: regex }, { status: regex }]
    }).limit(5).select('name status'),

    SupportTicket.find({
      $or: [{ subject: regex }, { description: regex }, { ticketNumber: regex }]
    }).limit(5).select('subject ticketNumber status priority')
  ]);

  const modules = [
    { type: 'Module', title: 'Dashboard', subtitle: 'System Overview', link: '/admin/dashboard', id: 'mod-1', meta: 'Page' },
    { type: 'Module', title: 'Projects', subtitle: 'Manage interior projects', link: '/admin/projects', id: 'mod-2', meta: 'Page' },
    { type: 'Module', title: 'Leads', subtitle: 'Manage client leads', link: '/admin/leads', id: 'mod-3', meta: 'Page' },
    { type: 'Module', title: 'Catalog', subtitle: 'Product and material catalog', link: '/admin/catalog', id: 'mod-4', meta: 'Page' },
    { type: 'Module', title: 'CMS', subtitle: 'Content Management', link: '/admin/cms', id: 'mod-5', meta: 'Page' },
    { type: 'Module', title: 'Appointments', subtitle: 'View bookings', link: '/admin/appointments', id: 'mod-6', meta: 'Page' },
    { type: 'Module', title: 'Finance', subtitle: 'Financial overview', link: '/admin/finance', id: 'mod-7', meta: 'Page' },
    { type: 'Module', title: 'Analytics', subtitle: 'Data and insights', link: '/admin/analytics', id: 'mod-8', meta: 'Page' },
    { type: 'Module', title: 'Support', subtitle: 'Ticketing and support', link: '/admin/support', id: 'mod-9', meta: 'Page' },
    { type: 'Module', title: 'Notifications', subtitle: 'Activity alerts', link: '/admin/notifications', id: 'mod-10', meta: 'Page' },
    { type: 'Module', title: 'Client CRM', subtitle: 'Customer Relationship', link: '/admin/crm', id: 'mod-11', meta: 'Page' },
    { type: 'Module', title: 'User Management', subtitle: 'Staff and clients', link: '/admin/users', id: 'mod-12', meta: 'Page' }
  ];

  const matchedModules = modules.filter(m => m.title.toLowerCase().includes(q.toLowerCase()));

  const results = [
    ...matchedModules,
    ...users.map(u => ({ type: 'User', title: u.fullName, subtitle: u.email, link: `/admin/users`, id: u._id, meta: u.role })),
    ...projects.map(p => ({ type: 'Project', title: p.name, subtitle: `Status: ${p.status}`, link: `/admin/projects/${p._id}`, id: p._id })),
    ...tickets.map(t => ({ type: 'Ticket', title: t.subject, subtitle: t.ticketNumber, link: `/admin/support`, id: t._id, meta: t.status }))
  ];

  res.status(200).json({ success: true, data: results });
});
