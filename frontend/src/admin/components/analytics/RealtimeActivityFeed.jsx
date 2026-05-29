import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RealtimeActivityFeed({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e0d8] h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#2d2a26] flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
            Realtime Global Feed
          </h2>
          <p className="text-sm text-[#8b8175] mt-1">Live business activity stream</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[300px]">
        <AnimatePresence>
          {data.map((log) => (
            <motion.div 
              key={log._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-l-2 border-[#e5e0d8] pl-4 relative"
            >
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-400 ring-4 ring-white" />
              <h4 className="font-bold text-[#2d2a26] text-sm">{log.title}</h4>
              <p className="text-xs text-[#8b8175] mt-1">{log.description}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-wider">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
