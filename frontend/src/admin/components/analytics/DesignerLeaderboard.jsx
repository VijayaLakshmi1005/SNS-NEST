import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp } from 'lucide-react';

export default function DesignerLeaderboard({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e0d8] h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#2d2a26] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Performers
          </h2>
          <p className="text-sm text-[#8b8175] mt-1">Designers ranked by generated revenue</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((designer, idx) => (
          <div key={designer._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#fcfbf9] transition-colors border border-transparent hover:border-[#e5e0d8] group">
            <div className="flex items-center gap-4">
              <div className="relative">
                {designer.avatar ? (
                  <img src={designer.avatar} alt={designer.name} className="w-10 h-10 rounded-full object-cover border border-[#e5e0d8]" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#f5f4f0] flex items-center justify-center text-[#2d2a26] font-bold border border-[#e5e0d8]">
                    {designer.name.charAt(0)}
                  </div>
                )}
                {idx === 0 && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-sm">
                    1
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-[#2d2a26] group-hover:text-amber-600 transition-colors">{designer.name}</h4>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[#2d2a26]">₹{designer.revenue >= 100000 ? (designer.revenue / 100000).toFixed(1) + 'L' : designer.revenue.toLocaleString()}</div>
              <div className="text-[10px] text-green-500 font-bold uppercase flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" /> Revenue</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
