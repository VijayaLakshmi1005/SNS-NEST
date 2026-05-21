import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, CreditCard, Activity as ActivityIcon, MessageSquare } from 'lucide-react';

const iconMap = {
  payment_received: CreditCard,
  project_milestone: CheckCircle,
  user_registered: Clock,
  lead_converted: ActivityIcon,
  system: MessageSquare
};

export default function UserTimeline({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="text-center py-8 text-[#8b8175] text-sm">
        No recent activity found for this user.
      </div>
    );
  }

  return (
    <div className="relative border-l border-[#e5e0d8] ml-4 space-y-6">
      {activities.map((activity, idx) => {
        const Icon = iconMap[activity.type] || ActivityIcon;
        return (
          <motion.div 
            key={activity._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-6"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white border border-[#e5e0d8] flex items-center justify-center shadow-sm">
              <Icon className="w-3 h-3 text-[#2d2a26]" />
            </div>

            {/* Content */}
            <div>
              <p className="text-sm font-medium text-[#2d2a26]">{activity.title}</p>
              {activity.description && (
                <p className="text-xs text-[#8b8175] mt-1">{activity.description}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-2">
                {new Date(activity.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
