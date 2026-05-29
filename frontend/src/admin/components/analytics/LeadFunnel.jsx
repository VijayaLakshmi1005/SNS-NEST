import React from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronRight, Target } from 'lucide-react';

export default function LeadFunnel({ data }) {
  if (!data || !data.funnel) return null;

  const steps = [
    { label: 'New Leads', value: data.funnel.new, color: 'bg-purple-100 text-purple-600 border-purple-200' },
    { label: 'Contacted', value: data.funnel.contacted, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { label: 'Interested', value: data.funnel.interested, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { label: 'Scheduled', value: data.funnel.scheduled, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { label: 'Converted', value: data.funnel.converted, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e0d8] h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#2d2a26] flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-500" />
            Lead Conversion Funnel
          </h2>
          <p className="text-sm text-[#8b8175] mt-1">From initial contact to signed project</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#2d2a26]">{data.winRate}%</div>
          <div className="text-xs text-green-500 font-bold flex items-center gap-1"><Target className="w-3 h-3" /> Win Rate</div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {steps.map((step, idx) => {
          const percentage = data.total > 0 ? (step.value / data.total) * 100 : 0;
          return (
            <div key={idx} className="relative group">
              <div className={`border p-4 rounded-xl flex items-center justify-between relative overflow-hidden ${step.color} transition-all duration-300 hover:shadow-md cursor-default`}>
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-white/40 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative z-10 flex items-center gap-3">
                  <span className="font-bold">{step.label}</span>
                </div>
                <div className="relative z-10 font-bold text-lg">
                  {step.value}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
                  <ChevronRight className="w-4 h-4 text-gray-300 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
