import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Briefcase, DollarSign, TrendingUp, Activity as ActivityIcon } from 'lucide-react';

export default function OverviewMetrics({ data }) {
  if (!data) return <div className="animate-pulse h-24 bg-[#e6e6df] rounded-xl"></div>;

  const statCards = [
    { title: 'Total Revenue', value: `$${(data.revenue / 1000).toFixed(1)}k`, icon: DollarSign, trend: data.revenueTrend },
    { title: 'Active Projects', value: data.activeProjects, icon: Briefcase, trend: data.projectsTrend },
    { title: 'Total Users', value: data.totalUsers, icon: Users, trend: data.usersTrend },
    { title: 'New Leads', value: data.newLeads, icon: TrendingUp, trend: data.leadsTrend },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i}>
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
