import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, Clock, FileCheck } from 'lucide-react';

export default function PerformanceAnalytics({ designer }) {
  // Mock performance data based on designer stats
  const responseTime = Math.floor(Math.random() * 4) + 1; // 1-4 hours
  const revisionRate = Math.floor(Math.random() * 10) + 5; // 5-15%
  const onTimeDelivery = Math.floor(Math.random() * 15) + 85; // 85-100%

  return (
    <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#8b8175]" /> Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-3 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[#8b8175]">Avg. Response Time</p>
              <p className="font-bold text-sm text-[#2d2a26]">{responseTime} hrs</p>
            </div>
          </div>
          <span className="text-xs text-green-600 font-medium">Excellent</span>
        </div>

        <div className="p-3 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-[#8b8175]">Revision Rate</p>
              <p className="font-bold text-sm text-[#2d2a26]">{revisionRate}%</p>
            </div>
          </div>
          <span className="text-xs text-orange-500 font-medium">Average</span>
        </div>

        <div className="p-3 bg-[#fcfbf9] border border-[#e5e0d8] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-[#8b8175]">On-time Delivery</p>
              <p className="font-bold text-sm text-[#2d2a26]">{onTimeDelivery}%</p>
            </div>
          </div>
          <span className="text-xs text-green-600 font-medium">Top Tier</span>
        </div>

      </CardContent>
    </Card>
  );
}
