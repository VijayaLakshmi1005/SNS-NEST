import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueAnalytics({ data }) {
  if (!data) return <div className="animate-pulse h-64 bg-[#e6e6df] rounded-xl"></div>;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Revenue Analytics</CardTitle>
        <CardDescription>Monthly revenue growth over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <div style={{ width: '100%', height: '100%', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6df" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8b8175', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b8175', fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fbfbf9' }}
                itemStyle={{ color: '#d4cfc5' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
