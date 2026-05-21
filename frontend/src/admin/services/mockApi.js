// Mock data and API service for the admin panel
// This simulates an external API to prevent hardcoding static data in components

const MOCK_DB = {
  stats: {
    totalUsers: 1420,
    activeProjects: 45,
    revenue: 1250000,
    newLeads: 28,
    designerPerformanceAvg: 4.8,
    pendingConsultations: 12
  },
  users: [
    { id: '1', name: 'Eleanor Vance', email: 'eleanor@example.com', role: 'client', status: 'active', joined: '2025-10-12' },
    { id: '2', name: 'Arthur Pendelton', email: 'arthur@example.com', role: 'client', status: 'verified', joined: '2025-11-05' },
    { id: '3', name: 'Sophia Sterling', email: 'sophia@example.com', role: 'designer', status: 'active', joined: '2024-03-22' },
  ],
  designers: [
    { id: '3', name: 'Sophia Sterling', email: 'sophia@example.com', activeProjects: 5, completedProjects: 24, rating: 4.9, revenue: 450000 },
    { id: '4', name: 'James Rutherford', email: 'james@example.com', activeProjects: 3, completedProjects: 18, rating: 4.7, revenue: 320000 },
  ],
  projects: [
    { id: 'P101', client: 'Eleanor Vance', designer: 'Sophia Sterling', status: 'execution', value: 85000, deadline: '2026-08-15' },
    { id: 'P102', client: 'Arthur Pendelton', designer: 'James Rutherford', status: 'design approval', value: 120000, deadline: '2026-09-30' },
  ],
  leads: [
    { id: 'L1001', name: 'Victoria Chase', source: 'Website', status: 'New Lead', value: 50000, date: '2026-05-20' },
    { id: 'L1002', name: 'Jonathan Pierce', source: 'AI Visualizer', status: 'Consultation Scheduled', value: 150000, date: '2026-05-18' },
    { id: 'L1003', name: 'Maya Lin', source: 'Referral', status: 'Interested', value: 75000, date: '2026-05-19' },
  ],
  revenueChart: [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 59000 },
    { name: 'Jun', revenue: 85000 },
  ]
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const adminApi = {
  getDashboardStats: async () => {
    await delay(600);
    return MOCK_DB.stats;
  },
  getRevenueChartData: async () => {
    await delay(500);
    return MOCK_DB.revenueChart;
  },
  getUsers: async (page = 1, filters = {}) => {
    await delay(800);
    return MOCK_DB.users;
  },
  getDesigners: async () => {
    await delay(700);
    return MOCK_DB.designers;
  },
  getProjects: async () => {
    await delay(900);
    return MOCK_DB.projects;
  },
  getLeads: async () => {
    await delay(500);
    return MOCK_DB.leads;
  },
  updateLeadStatus: async (leadId, newStatus) => {
    await delay(400);
    const lead = MOCK_DB.leads.find(l => l.id === leadId);
    if(lead) lead.status = newStatus;
    return lead;
  }
};
