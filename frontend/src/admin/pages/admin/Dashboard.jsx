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
              <div className="p-3 bg-[#e6e6df] rounded-lg cursor-pointer hover:bg-[#d4cfc5] transition">
                <h4 className="font-semibold text-sm text-[#1a1a1a]">Assign Designer</h4>
                <p className="text-xs text-[#8b8175]">3 projects waiting for assignment</p>
              </div>
              <div className="p-3 bg-[#e6e6df] rounded-lg cursor-pointer hover:bg-[#d4cfc5] transition">
                <h4 className="font-semibold text-sm text-[#1a1a1a]">Review Proposals</h4>
                <p className="text-xs text-[#8b8175]">2 new design proposals</p>
              </div>
              <div className="p-3 bg-[#e6e6df] rounded-lg cursor-pointer hover:bg-[#d4cfc5] transition">
                <h4 className="font-semibold text-sm text-[#1a1a1a]">Lead Follow-ups</h4>
                <p className="text-xs text-[#8b8175]">5 leads need contacting today</p>
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
