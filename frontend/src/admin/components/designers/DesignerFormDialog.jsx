import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, User, Mail, Phone, Briefcase, Star, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export default function DesignerFormDialog({ isOpen, onClose, onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    expertise: '',
    experience: '',
    bio: '',
    status: 'Available',
    profileImage: ''
  });

  // Effect to update formData when initialData changes or component mounts
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.name || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || initialData.user?.mobile || '',
        password: '',
        expertise: initialData.specialization || '',
        experience: initialData.experience || '',
        bio: initialData.bio || '',
        status: initialData.status || 'Available',
        profileImage: initialData.profileImage || ''
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        expertise: '',
        experience: '',
        bio: '',
        status: 'Available',
        profileImage: ''
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authStorageStr = localStorage.getItem('auth-storage');
      const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
      
      const endpoint = initialData 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/designers/${initialData._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/designers/create`;
      
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Error saving designer');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save designer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#fcfcfb] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e6e6df] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#e6e6df] bg-white">
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-[#1a1a1a]">
              {initialData ? 'Edit Designer Profile' : 'Add New Designer'}
            </h2>
            <p className="text-sm text-[#8b8175] mt-1">
              {initialData ? 'Update designer credentials and portfolio details.' : 'Onboard a new designer to the ecosystem.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[#8b8175] hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="designerForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8b8175] flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  value={formData.fullName} 
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-[#e6e6df] rounded-xl focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8b8175] flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-[#e6e6df] rounded-xl focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  placeholder="sarah@snsnest.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8b8175] flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  required 
                  value={formData.phoneNumber} 
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-[#e6e6df] rounded-xl focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              {!initialData && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8b8175] flex items-center gap-2">
                    Password
                  </label>
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-[#e6e6df] rounded-xl focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    placeholder="Create a secure password"
                  />
                </div>
              )}
            </div>

            <hr className="border-[#e6e6df]" />

            {/* Professional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8b8175] flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Area of Expertise
                </label>
                <input 
                  type="text" 
                  name="expertise" 
                  value={formData.expertise} 
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-[#e6e6df] rounded-xl focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  placeholder="e.g. Minimalist, Modern Luxury"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8b8175] flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Years of Experience
                </label>
                <input 
                  type="number" 
                  name="experience" 
                  min="0"
                  value={formData.experience} 
                  onChange={handleChange}
                  className="w-full p-3 bg-white border border-[#e6e6df] rounded-xl focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8b8175] flex items-center gap-2">
                Designer Bio
              </label>
              <textarea 
                name="bio" 
                rows={4}
                value={formData.bio} 
                onChange={handleChange}
                className="w-full p-3 bg-white border border-[#e6e6df] rounded-xl focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none"
                placeholder="A brief background about the designer's style and achievements..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8b8175] flex items-center gap-2">
                <Upload className="w-3 h-3" /> Profile Image URL
              </label>
              <input 
                type="url" 
                name="profileImage" 
                value={formData.profileImage} 
                onChange={handleChange}
                className="w-full p-3 bg-white border border-[#e6e6df] rounded-xl focus:outline-none focus:border-[#1a1a1a] transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-[#8b8175]">Paste an image URL for the designer's profile photo.</p>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-[#e6e6df] bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-[#e6e6df] text-[#1a1a1a]">Cancel</Button>
          <Button 
            form="designerForm" 
            type="submit" 
            className="bg-[#1a1a1a] text-white hover:bg-[#333]"
            disabled={loading}
          >
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Designer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
