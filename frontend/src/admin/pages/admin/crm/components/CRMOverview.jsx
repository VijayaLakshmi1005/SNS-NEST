import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { useCrmStore } from '../../../../../store/useCrmStore';
import { Users, Activity, Target, Briefcase, Calendar, CreditCard, MessageSquare, Ticket } from 'lucide-react';
import { adminApi } from '../../../../services/mockApi';

export default function CRMOverview() {
  const { analytics, setAnalytics } = useCrmStore();

  React.useEffect(() => {
    // In a real app, this would be a React Query hook pointing to /api/crm/analytics
    // For now, let's mock it using adminApi or fetch directly
    const fetchAnalytics = async () => {
      try {
        const authStorageStr = localStorage.getItem('auth-storage');
        const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/crm/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch CRM analytics", err);
      }
    };
    fetchAnalytics();
  }, [setAnalytics]);

  if (!analytics) return <div className="h-32 animate-pulse bg-[#f5f5f0] rounded-xl border border-[#e6e6df]"></div>;

  const stats = [
    { label: 'Total Clients', value: analytics.totalClients, icon: <Users className="w-5 h-5 text-[#8b8175]" /> },
    { label: 'Active Clients', value: analytics.activeClients, icon: <Activity className="w-5 h-5 text-[#8b8175]" /> },

    { label: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: <CreditCard className="w-5 h-5 text-[#8b8175]" /> },
    { label: 'Active Projects', value: analytics.activeProjects, icon: <Briefcase className="w-5 h-5 text-[#8b8175]" /> },
    { label: 'Pending Consultations', value: analytics.pendingConsultations, icon: <Calendar className="w-5 h-5 text-[#8b8175]" /> },

    { label: 'Support Tickets', value: analytics.supportTickets, icon: <Ticket className="w-5 h-5 text-[#8b8175]" /> }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-[#e6e6df] shadow-sm hover:shadow-md transition-shadow bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#8b8175]">{stat.label}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-playfair font-bold text-[#1a1a1a]">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
