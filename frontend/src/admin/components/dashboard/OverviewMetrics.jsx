import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Briefcase, IndianRupee, TrendingUp, Activity as ActivityIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OverviewMetrics({ data }) {
  const navigate = useNavigate();
  if (!data) return <div className="animate-pulse h-24 bg-[#e6e6df] rounded-xl"></div>;

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (absNum >= 10000000) return `${sign}₹${(absNum / 10000000).toFixed(2)}Cr`;
    if (absNum >= 100000) return `${sign}₹${(absNum / 100000).toFixed(2)}L`;
    if (absNum >= 1000) return `${sign}₹${(absNum / 1000).toFixed(1)}k`;
    return `${sign}₹${absNum.toFixed(0)}`;
  };

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(data.revenue), icon: IndianRupee, trend: data.revenueTrend, link: '/admin/finance' },
    { title: 'Active Projects', value: data.activeProjects, icon: Briefcase, trend: data.projectsTrend, link: '/admin/projects' },
    { title: 'Total Users', value: data.totalUsers, icon: Users, trend: data.usersTrend, link: '/admin/users' },
    { title: 'New Leads', value: data.newLeads, icon: TrendingUp, trend: data.leadsTrend, link: '/admin/leads' },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} onClick={() => navigate(stat.link)} className="cursor-pointer hover:shadow-md transition-shadow hover:border-[#1a1a1a]/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#8b8175]">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-[#8b8175]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1a1a1a]">{stat.value}</div>
              <p className="text-xs text-green-700 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
