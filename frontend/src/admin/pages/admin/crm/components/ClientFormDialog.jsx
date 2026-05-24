import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export default function ClientFormDialog({ isOpen, onClose, clientData, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    clientStatus: 'New Lead'
  });

  const [designers, setDesigners] = useState([]);

  useEffect(() => {
    // Fetch designers
    const fetchDesigners = async () => {
      try {
        const authStorageStr = localStorage.getItem('auth-storage');
        const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/designers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDesigners(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch designers', err);
      }
    };
    fetchDesigners();
  }, []);

  useEffect(() => {
    if (clientData) {
      setFormData({
        fullName: clientData.fullName || '',
        email: clientData.email || '',
        mobile: clientData.mobile || '',
        clientStatus: clientData.clientStatus || 'NEW',
        assignedDesigner: clientData.assignedDesigner?._id || clientData.assignedDesigner || ''
      });
    } else {
      setFormData({ fullName: '', email: '', mobile: '', clientStatus: 'NEW', assignedDesigner: '' });
    }
  }, [clientData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authStorageStr = localStorage.getItem('auth-storage');
      const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
      const url = clientData 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/crm/clients/${clientData._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/crm/clients`;
      
      const method = clientData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
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
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#fcfcfb] w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-[#e6e6df]">
        <div className="px-6 py-4 border-b border-[#e6e6df] flex justify-between items-center bg-white">
          <h2 className="text-xl font-playfair font-semibold text-[#1a1a1a]">
            {clientData ? 'Edit Client' : 'Add New Lead'}
          </h2>
          <button onClick={onClose} className="text-[#8b8175] hover:text-[#1a1a1a]">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Full Name</label>
            <Input 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full bg-white border-[#e6e6df]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Email</label>
            <Input 
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white border-[#e6e6df]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Mobile</label>
            <Input 
              required
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              className="w-full bg-white border-[#e6e6df]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Status</label>
            <select
              value={formData.clientStatus}
              onChange={(e) => setFormData({...formData, clientStatus: e.target.value})}
              className="w-full border border-[#e6e6df] bg-white rounded-md text-sm p-2 outline-none uppercase"
            >
              <option value="NEW">NEW</option>
              <option value="FOLLOW-UP">FOLLOW-UP</option>
              <option value="MEETING">MEETING</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="CONVERTED">CONVERTED</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Assigned Designer</label>
            <select
              value={formData.assignedDesigner}
              onChange={(e) => setFormData({...formData, assignedDesigner: e.target.value})}
              className="w-full border border-[#e6e6df] bg-white rounded-md text-sm p-2 outline-none"
            >
              <option value="">Unassigned</option>
              {designers.map(d => (
                <option key={d._id} value={d._id}>{d.firstName} {d.lastName}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#1a1a1a] hover:bg-[#333] text-white">
              {clientData ? 'Save Changes' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
