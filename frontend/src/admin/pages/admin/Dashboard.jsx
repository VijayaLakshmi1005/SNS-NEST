import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useDashboard } from '../../hooks/useDashboard';
import OverviewMetrics from '../../components/dashboard/OverviewMetrics';
import RevenueAnalytics from '../../components/dashboard/RevenueAnalytics';
import LiveActivityFeed from '../../components/dashboard/LiveActivityFeed';
import TopDesigners from '../../components/dashboard/TopDesigners';

export default function Dashboard() {
  const { 
    overviewQuery, 
    revenueQuery, 
    activitiesQuery,
    designersQuery,
    isLoading 
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#e6e6df] border-t-[#1a1a1a] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#8b8175] text-sm animate-pulse">Syncing real-time dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-[#1a1a1a]">Overview</h1>
        <p className="text-[#8b8175] mt-1">Here's what's happening in your business today.</p>
      </div>

      <OverviewMetrics data={overviewQuery.data} />

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-5">
          <RevenueAnalytics data={revenueQuery.data} />
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div onClick={() => window.location.href='/admin/projects'} className="p-3 bg-[#e6e6df] rounded-lg cursor-pointer hover:bg-[#d4cfc5] transition">
                <h4 className="font-semibold text-sm text-[#1a1a1a]">Active Projects</h4>
                <p className="text-xs text-[#8b8175]">{overviewQuery.data?.activeProjects || 0} projects currently active</p>
              </div>
              <div onClick={() => window.location.href='/admin/leads'} className="p-3 bg-[#e6e6df] rounded-lg cursor-pointer hover:bg-[#d4cfc5] transition">
                <h4 className="font-semibold text-sm text-[#1a1a1a]">New Leads</h4>
                <p className="text-xs text-[#8b8175]">{overviewQuery.data?.newLeads || 0} new leads need contacting</p>
              </div>
              <div onClick={() => window.location.href='/admin/support'} className="p-3 bg-[#e6e6df] rounded-lg cursor-pointer hover:bg-[#d4cfc5] transition">
                <h4 className="font-semibold text-sm text-[#1a1a1a]">Support Tickets</h4>
                <p className="text-xs text-[#8b8175]">Check live support inbox</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveActivityFeed data={activitiesQuery.data} />
        <TopDesigners data={designersQuery.data} />
      </div>
    </div>
  );
}
