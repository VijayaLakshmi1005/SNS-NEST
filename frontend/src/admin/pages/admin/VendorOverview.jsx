import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Building2, Truck, Package, PackageOpen, Plus, Search, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VendorOverview() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('vendors');
  const [isCreatingPO, setIsCreatingPO] = useState(false);

  // Real-time Socket Connection
  useEffect(() => {
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true });
    socket.on('procurementCreated', () => queryClient.invalidateQueries(['procurements']));
    socket.on('procurementUpdated', () => queryClient.invalidateQueries(['procurements']));
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: vendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/vendors`, { withCredentials: true });
      return res.data.data;
    }
  });

  const { data: procurements = [], isLoading: loadingProcurements } = useQuery({
    queryKey: ['procurements'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/vendors/procurements`, { withCredentials: true });
      return res.data.data;
    }
  });

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/vendors/procurements/${id}/status`, { status: newStatus }, { withCredentials: true });
      // UI will auto-update via socket invalidate
    } catch (err) {
      alert('Failed to update procurement status.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Requested': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dispatched': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'In Transit': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-nav-style font-extrabold text-[#2d2a26]">Vendor Management</h1>
          <p className="text-[#8b8175]">Real-time luxury supply chain & procurement.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setIsCreatingPO(true)} className="flex items-center gap-2 px-4 py-2 bg-[#2d2a26] text-[#fcfbf9] rounded-lg font-bold hover:bg-black transition-colors shadow-sm w-full md:w-auto justify-center">
            <Plus className="w-4 h-4" /> New Purchase Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Active Vendors</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">{vendors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">In Transit</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">
                  {procurements.filter(p => p.status === 'In Transit' || p.status === 'Dispatched').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Delivered</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">
                  {procurements.filter(p => p.status === 'Delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Delayed / Alert</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#e5e0d8] mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          className={`pb-3 font-bold text-sm tracking-wide ${activeTab === 'vendors' ? 'border-b-2 border-[#2d2a26] text-[#2d2a26]' : 'text-[#8b8175] hover:text-[#2d2a26]'}`}
          onClick={() => setActiveTab('vendors')}
        >
          VENDOR DIRECTORY
        </button>
        <button
          className={`pb-3 font-bold text-sm tracking-wide ${activeTab === 'procurement' ? 'border-b-2 border-[#2d2a26] text-[#2d2a26]' : 'text-[#8b8175] hover:text-[#2d2a26]'}`}
          onClick={() => setActiveTab('procurement')}
        >
          PROCUREMENT TRACKING
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingVendors && <div className="col-span-full py-12 flex justify-center"><RefreshCw className="w-8 h-8 text-[#8b8175] animate-spin" /></div>}
          {vendors.map(vendor => (
            <Card key={vendor._id} className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-[#f5f5f0] text-[#8b8175] rounded-full">
                      {vendor.category}
                    </span>
                    <h3 className="text-xl font-bold text-[#2d2a26] mt-2 group-hover:text-[#656d4a] transition-colors">{vendor.companyName}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                    ★ {vendor.rating}
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-[#8b8175]">Contact: <span className="text-[#2d2a26] font-medium">{vendor.contactPerson}</span></p>
                  <p className="text-sm text-[#8b8175]">Phone: <span className="text-[#2d2a26] font-medium">{vendor.phone}</span></p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {vendor.materialsSupplied.map((mat, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 bg-white border border-[#e5e0d8] rounded text-[#8b8175]">{mat}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e5e0d8] flex justify-between items-center">
                  <p className="text-xs font-bold text-[#8b8175] uppercase">{vendor.completedDeliveries} Deliveries</p>
                  <button className="text-sm font-bold text-[#2d2a26] flex items-center gap-1 hover:underline">
                    View Profile <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'procurement' && (
        <div className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
              <tr className="bg-[#fcfbf9] border-b border-[#e5e0d8]">
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Project / PO</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Vendor</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Items</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e0d8]">
              {loadingProcurements && (
                <tr><td colSpan="6" className="p-8 text-center"><RefreshCw className="w-6 h-6 text-[#8b8175] animate-spin mx-auto" /></td></tr>
              )}
              {procurements.map(p => (
                <tr key={p._id} className="hover:bg-[#f5f5f0]/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#2d2a26]">{p.projectName || 'Stock Inventory'}</p>
                    <p className="text-xs text-[#8b8175]">PO-{p._id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-[#2d2a26]">{p.vendor?.companyName}</p>
                    <p className="text-xs text-[#8b8175]">{p.vendor?.category}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-[#2d2a26]">{p.items?.length || 0} items</p>
                  </td>
                  <td className="p-4 font-medium text-[#2d2a26]">₹{p.totalAmount?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      className="text-xs font-bold bg-white border border-[#e5e0d8] rounded-lg px-2 py-1.5 outline-none text-[#2d2a26]"
                      value={p.status}
                      onChange={(e) => handleUpdateStatus(p._id, e.target.value)}
                    >
                      <option value="Requested">Requested</option>
                      <option value="Processing">Processing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {procurements.length === 0 && !loadingProcurements && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#8b8175]">
                    <PackageOpen className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    No active procurement orders.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
