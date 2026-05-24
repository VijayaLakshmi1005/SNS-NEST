import React, { useState, useEffect } from 'react';
import { useCrmStore } from '../../../../../store/useCrmStore';
import { Phone, Mail, MessageCircle, Clock, AlertCircle, Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export default function ClientDrawer() {
  const { isDrawerOpen, selectedClientId, closeClientDrawer, setFilter } = useCrmStore();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isDrawerOpen && selectedClientId) {
      fetchClientDetails();
    } else {
      setClient(null);
    }
  }, [isDrawerOpen, selectedClientId]);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      const authStorageStr = localStorage.getItem('auth-storage');
      const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/crm/clients/${selectedClientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setClient(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch client details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFollowUp = async (daysToAdd) => {
    if (!client) return;
    setUpdating(true);
    try {
      const nextFollowUpDate = new Date();
      nextFollowUpDate.setDate(nextFollowUpDate.getDate() + daysToAdd);

      const authStorageStr = localStorage.getItem('auth-storage');
      const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/crm/clients/${selectedClientId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ nextFollowUp: nextFollowUpDate.toISOString() })
      });
      const data = await res.json();
      if (data.success) {
        setClient(data.data);
        setFilter('refresh', Date.now()); // Refresh table
      }
    } catch (err) {
      console.error('Failed to update follow-up', err);
    } finally {
      setUpdating(false);
    }
  };

  if (!isDrawerOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeClientDrawer}
      />
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#fcfcfb] shadow-2xl border-l border-[#e6e6df] z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-[#8b8175]">Loading...</div>
        ) : client ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e6e6df] bg-white sticky top-0 z-10 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-playfair font-semibold text-[#1a1a1a]">{client.fullName}</h2>
                <p className="text-sm text-[#8b8175]">{client.email}</p>
              </div>
              <button onClick={closeClientDrawer} className="p-2 -mr-2 text-[#8b8175] hover:text-[#1a1a1a] rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              
              {/* Next Follow-Up Component */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#f5f5f0] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#8b8175]" />
                  </div>
                  <h3 className="text-lg font-playfair font-semibold text-[#1a1a1a]">Next Follow-Up</h3>
                </div>
                <p className="text-xs text-[#8b8175] ml-10 mb-4">Keep track of your client engagements</p>

                <div className="border border-dashed border-[#e6e6df] rounded-xl p-8 flex flex-col items-center justify-center bg-white relative">
                  {updating && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a1a1a]"></div>
                    </div>
                  )}
                  
                  {client.nextFollowUp ? (
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                        <CalendarIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <h4 className="text-lg font-bold text-[#1a1a1a]">
                        {new Date(client.nextFollowUp).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </h4>
                      <p className="text-xs text-green-600 font-medium mt-1">Follow-up scheduled</p>
                    </div>
                  ) : (
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-full border border-[#e6e6df] flex items-center justify-center mx-auto mb-3 shadow-sm bg-[#fcfcfb]">
                        <AlertCircle className="w-5 h-5 text-[#8b8175]" />
                      </div>
                      <p className="text-sm font-medium text-[#8b8175]">No follow-up has been scheduled yet.</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 w-full justify-center">
                    <Button 
                      className="bg-[#1a1a1a] hover:bg-[#333] text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2 h-auto rounded-lg"
                      onClick={() => handleUpdateFollowUp(3)}
                    >
                      +3 DAYS
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-[#e6e6df] text-[#1a1a1a] hover:bg-[#f5f5f0] text-[10px] font-bold tracking-widest uppercase px-6 py-2 h-auto rounded-lg"
                      onClick={() => handleUpdateFollowUp(7)}
                    >
                      +1 WEEK
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-[#e6e6df] text-[#1a1a1a] hover:bg-[#f5f5f0] text-[10px] font-bold tracking-widest uppercase px-6 py-2 h-auto rounded-lg gap-2"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'date';
                        input.onchange = (e) => {
                          const date = new Date(e.target.value);
                          if(date) {
                            const diffTime = Math.abs(date - new Date());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            handleUpdateFollowUp(diffDays);
                          }
                        };
                        input.click();
                      }}
                    >
                      <CalendarIcon className="w-3 h-3" />
                      DATE
                    </Button>
                  </div>
                </div>
              </div>

              <hr className="border-[#e6e6df]" />

              {/* Quick Engagement Component */}
              <div>
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#8b8175] mb-4">Quick Engagement</h4>
                <div className="grid grid-cols-3 gap-4">
                  <a href={`tel:${client.mobile}`} className="flex flex-col items-center justify-center border border-[#e6e6df] bg-white rounded-xl p-4 hover:border-[#1a1a1a] transition-colors group cursor-pointer">
                    <Phone className="w-6 h-6 text-[#1a1a1a] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#1a1a1a]">Call</span>
                  </a>
                  <a href={`mailto:${client.email}`} className="flex flex-col items-center justify-center border border-[#e6e6df] bg-white rounded-xl p-4 hover:border-[#1a1a1a] transition-colors group cursor-pointer">
                    <Mail className="w-6 h-6 text-[#1a1a1a] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#1a1a1a]">Email</span>
                  </a>
                  <a href={`https://wa.me/${client.mobile}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center border border-[#e6e6df] bg-white rounded-xl p-4 hover:border-[#25D366] transition-colors group cursor-pointer">
                    <MessageCircle className="w-6 h-6 text-[#25D366] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#1a1a1a]">WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-red-500">Failed to load client</div>
        )}
      </div>
    </>
  );
}
