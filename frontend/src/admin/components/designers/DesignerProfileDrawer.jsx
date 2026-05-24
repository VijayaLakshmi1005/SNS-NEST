import React from 'react';
import { X, MapPin, Mail, Phone, Clock, Briefcase, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

export default function DesignerProfileDrawer({ designer, isOpen, onClose }) {
  if (!isOpen || !designer) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Side Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#fcfbf9] shadow-2xl z-50 transform transition-transform duration-500 ease-in-out border-l border-[#e5e0d8] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Profile Section */}
        <div className="relative h-48 bg-[#1a1a1a]">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl border-4 border-[#fcfbf9] bg-white shadow-lg overflow-hidden flex items-center justify-center">
              {designer.profileImage ? (
                <img src={designer.profileImage} alt={designer.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#2d2a26] text-4xl font-bold font-nav-style">{designer.name.charAt(0)}</span>
              )}
            </div>
            <div className="mb-2">
              <h2 className="text-3xl font-playfair font-bold text-[#2d2a26]">{designer.name}</h2>
              <p className="text-sm font-medium text-[#8b8175] flex items-center gap-2">
                {designer.specialization}
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider text-white ${
                    designer.status === 'Active' || designer.status === 'Available' ? 'bg-green-600' : 
                    designer.status === 'Busy' ? 'bg-orange-500' : 'bg-gray-500'
                  }`}>
                  {designer.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pt-24 pb-8 px-8 space-y-8">
          
          {/* Contact & Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#e5e0d8] space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
                <Mail className="w-4 h-4 text-[#8b8175]" /> {designer.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
                <Phone className="w-4 h-4 text-[#8b8175]" /> {designer.phoneNumber || designer.user?.mobile || 'N/A'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#e5e0d8] space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
                <Briefcase className="w-4 h-4 text-[#8b8175]" /> {designer.experience || 0} Years Exp.
              </div>
              <div className="flex items-center gap-2 text-sm text-[#2d2a26]">
                <Calendar className="w-4 h-4 text-[#8b8175]" /> {designer.activeProjects?.length || 0} Active Projects
              </div>
            </div>
          </div>

          {/* Bio section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#8b8175]">Designer Biography</h3>
            <p className="text-sm text-[#2d2a26] leading-relaxed bg-white p-5 rounded-xl border border-[#e5e0d8]">
              {designer.bio || 'No biography provided yet. Edit the profile to add more details about this designer.'}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#e5e0d8] bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-[#e5e0d8] text-[#1a1a1a]">Close Profile</Button>
          <Button 
            className="bg-[#1a1a1a] text-white hover:bg-[#333]"
            onClick={() => {
              const phone = designer.phoneNumber || designer.user?.mobile;
              if (phone) {
                const cleanPhone = phone.replace(/\D/g, '');
                window.open(`https://wa.me/${cleanPhone}`, '_blank');
              } else {
                alert('No phone number saved for this designer.');
              }
            }}
          >
            Message Designer
          </Button>
        </div>
      </div>
    </>
  );
}
