import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const statusColors = {
  'Open': 'bg-red-50 text-red-600 border-red-200',
  'In-Progress': 'bg-blue-50 text-blue-600 border-blue-200',
  'Waiting for Client': 'bg-yellow-50 text-yellow-600 border-yellow-200',
  'Resolved': 'bg-green-50 text-green-600 border-green-200',
  'Closed': 'bg-gray-50 text-gray-600 border-gray-200'
};

const statusIcons = {
  'Open': AlertCircle,
  'In-Progress': Clock,
  'Waiting for Client': Clock,
  'Resolved': CheckCircle,
  'Closed': CheckCircle
};

export default function SupportTicketManager({ tickets = [] }) {
  if (!tickets.length) {
    return (
      <div className="text-center py-8 text-[#8b8175] text-sm">
        No support tickets filed by this client.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket, idx) => {
        const StatusIcon = statusIcons[ticket.status] || AlertCircle;
        
        return (
          <motion.div
            key={ticket._id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-xl border border-[#e5e0d8] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h4 className="font-nav-style font-bold text-[#2d2a26] flex items-center gap-2">
                {ticket.subject}
                <span className={`px-2 py-0.5 text-[10px] rounded-full border ${statusColors[ticket.status]}`}>
                  {ticket.status}
                </span>
              </h4>
              <p className="text-xs text-[#8b8175] mt-1">
                Last updated: {new Date(ticket.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
              </p>
            </div>
            
            <button className="text-sm px-4 py-2 bg-[#fcfbf9] border border-[#e5e0d8] hover:bg-[#e5e0d8] transition-colors rounded-xl font-medium text-[#2d2a26]">
              Manage Ticket
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
