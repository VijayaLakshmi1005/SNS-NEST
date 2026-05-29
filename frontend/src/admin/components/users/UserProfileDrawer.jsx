import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, Clock, CreditCard, Tag, ShieldAlert, Star, Activity, Plus } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import moment from 'moment';

export default function UserProfileDrawer({ isOpen, onClose, profile }) {
  if (!isOpen || !profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1a1a1a]/20 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#fbfbf9] shadow-2xl z-[101] flex flex-col border-l border-[#e6e6df]"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-[#e6e6df] bg-white flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-lg font-playfair font-bold text-[#1a1a1a]">CRM Profile</h2>
              <button onClick={onClose} className="p-2 hover:bg-[#f5f5f0] rounded-full transition-colors text-[#8b8175]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              
              {/* Profile Header */}
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-[#E3D5CA] flex items-center justify-center text-3xl font-playfair text-[#1a1a1a] shadow-inner">
                  {profile.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-1">{profile.fullName}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="capitalize">{profile.role}</Badge>
                    <Badge variant={profile.isVerified ? 'success' : 'secondary'}>
                      {profile.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                    {profile.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                  </div>
                  <div className="space-y-1 text-sm text-[#8b8175]">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {profile.mobile}</p>
                  </div>
                </div>
              </div>

              {/* CRM Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-[#e6e6df]">
                  <p className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-[#1a1a1a]">₹{profile.totalSpent?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-[#e6e6df]">
                  <p className="text-xs font-semibold text-[#8b8175] uppercase tracking-wider mb-1">Health Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-[#1a1a1a]">{profile.clientHealthScore || 100}</p>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>

              {/* CRM Meta */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] border-b border-[#e6e6df] pb-2">Client Details</h4>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-[#8b8175] mb-1 text-xs uppercase tracking-wider">Status</p>
                    <p className="font-medium text-[#1a1a1a]">{profile.clientStatus || 'New Lead'}</p>
                  </div>
                  <div>
                    <p className="text-[#8b8175] mb-1 text-xs uppercase tracking-wider">Joined Date</p>
                    <p className="font-medium text-[#1a1a1a] flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {moment(profile.createdAt).format('MMM D, YYYY')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8b8175] mb-1 text-xs uppercase tracking-wider">Assigned Designer</p>
                    <p className="font-medium text-[#1a1a1a] flex items-center gap-2">
                      {profile.assignedDesigner?.fullName || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8b8175] mb-1 text-xs uppercase tracking-wider">Last Activity</p>
                    <p className="font-medium text-[#1a1a1a] flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {moment(profile.lastActivityAt).fromNow()}
                    </p>
                  </div>
                </div>
                {profile.crmTags?.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[#8b8175] mb-2 text-xs uppercase tracking-wider">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.crmTags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 text-xs font-medium bg-[#f5f5f0] text-[#1a1a1a] rounded-md flex items-center gap-1 border border-[#e6e6df]">
                          <Tag className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Internal Notes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e6e6df] pb-2">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]">Internal Notes</h4>
                  <button className="text-xs font-bold flex items-center gap-1 text-[#8b8175] hover:text-[#1a1a1a]">
                    <Plus className="w-3 h-3" /> Add Note
                  </button>
                </div>
                {profile.internalNotes?.length > 0 ? (
                  <div className="space-y-3">
                    {profile.internalNotes.slice().reverse().map((note, i) => (
                      <div key={i} className="p-3 bg-white border border-[#e6e6df] rounded-lg text-sm">
                        <p className="text-[#1a1a1a]">{note.note}</p>
                        <p className="text-[10px] text-[#8b8175] mt-2 uppercase tracking-wider">{moment(note.createdAt).format('MMM D, YYYY HH:mm')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8b8175] italic">No internal notes added yet.</p>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] border-b border-[#e6e6df] pb-2">Recent Activity</h4>
                {profile.activities?.length > 0 ? (
                  <div className="relative border-l border-[#e6e6df] ml-2 space-y-4 py-2">
                    {profile.activities.map((act, i) => (
                      <div key={i} className="pl-6 relative">
                        <div className="absolute w-3 h-3 bg-[#1a1a1a] rounded-full -left-[6.5px] top-1.5" />
                        <p className="text-sm font-medium text-[#1a1a1a]">{act.title || act.action}</p>
                        <p className="text-xs text-[#8b8175] mt-1">{moment(act.createdAt).format('MMM D, YYYY HH:mm')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8b8175] italic">No recent activity found.</p>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
