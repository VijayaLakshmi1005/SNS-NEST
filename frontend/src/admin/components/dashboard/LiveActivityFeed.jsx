import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Activity as ActivityIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveActivityFeed({ data }) {
  if (!data) return <div className="animate-pulse h-64 bg-[#e6e6df] rounded-xl"></div>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Activities
        </CardTitle>
        <CardDescription>Real-time updates from the system</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          <AnimatePresence>
            {data.length === 0 ? (
              <div className="text-sm text-[#8b8175] text-center py-4">No recent activities.</div>
            ) : (
              data.map((activity, index) => (
                <motion.div
                  key={activity._id || index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 pb-4 border-b border-[#e6e6df] last:border-0"
                >
                  <div className="bg-[#fbfbf9] p-2 rounded-full mt-1 border border-[#e6e6df]">
                    <ActivityIcon className="w-4 h-4 text-[#8b8175]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#1a1a1a]">{activity.title}</h4>
                    <p className="text-xs text-[#8b8175] mt-1">{activity.description}</p>
                    <span className="text-[10px] text-[#8b8175] mt-2 block">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
