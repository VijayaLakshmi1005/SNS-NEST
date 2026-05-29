import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function RevenueCharts({ data }) {
  if (!data || !data.monthlyTrend) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e0d8] h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#2d2a26] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Revenue Growth
          </h2>
          <p className="text-sm text-[#8b8175] mt-1">6-month revenue trend analysis</p>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8b8175', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b8175', fontSize: 12 }} tickFormatter={(value) => `₹${value >= 100000 ? (value / 100000).toFixed(1) + 'L' : value}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e0d8', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#2d2a26', fontWeight: 'bold' }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
