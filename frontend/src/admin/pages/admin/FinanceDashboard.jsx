import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, Download, TrendingUp, TrendingDown, RefreshCw, Briefcase, Plus } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function FinanceDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true });
    socket.on('financeUpdated', () => queryClient.invalidateQueries(['financeOverview']));
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: finance, isLoading } = useQuery({
    queryKey: ['financeOverview'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/finance/overview`, { withCredentials: true });
      return res.data.data;
    }
  });

  const chartData = [
    { name: 'Jan', revenue: 400000, expense: 240000 },
    { name: 'Feb', revenue: 300000, expense: 139800 },
    { name: 'Mar', revenue: 200000, expense: 98000 },
    { name: 'Apr', revenue: 278000, expense: 390800 },
    { name: 'May', revenue: 189000, expense: 48000 },
    { name: 'Jun', revenue: 239000, expense: 38000 },
    { name: 'Jul', revenue: 349000, expense: 43000 },
  ];

  if (isLoading || !finance) return <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 text-[#8b8175] animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-nav-style font-extrabold text-[#2d2a26]">Finance & Accounting</h1>
          <p className="text-[#8b8175]">Real-time luxury revenue, invoices & procurement expenses.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e0d8] text-[#2d2a26] rounded-lg font-bold hover:bg-[#fcfbf9] transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2d2a26] text-[#fcfbf9] rounded-lg font-bold hover:bg-black transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#e5e0d8] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Total Revenue</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">₹{finance.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Pending Dues</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">₹{finance.pendingDues.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Total Expenses</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">₹{finance.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e0d8] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider">Net Profit</p>
                <p className="text-3xl font-extrabold text-[#2d2a26]">₹{finance.netProfit.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#e5e0d8] mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          className={`pb-3 font-bold text-sm tracking-wide ${activeTab === 'overview' ? 'border-b-2 border-[#2d2a26] text-[#2d2a26]' : 'text-[#8b8175] hover:text-[#2d2a26]'}`}
          onClick={() => setActiveTab('overview')}
        >
          ANALYTICS OVERVIEW
        </button>
        <button
          className={`pb-3 font-bold text-sm tracking-wide ${activeTab === 'invoices' ? 'border-b-2 border-[#2d2a26] text-[#2d2a26]' : 'text-[#8b8175] hover:text-[#2d2a26]'}`}
          onClick={() => setActiveTab('invoices')}
        >
          INVOICES & BILLING
        </button>
        <button
          className={`pb-3 font-bold text-sm tracking-wide ${activeTab === 'expenses' ? 'border-b-2 border-[#2d2a26] text-[#2d2a26]' : 'text-[#8b8175] hover:text-[#2d2a26]'}`}
          onClick={() => setActiveTab('expenses')}
        >
          EXPENSES & PROCUREMENT
        </button>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'overview' && (
        <Card className="bg-white border-[#e5e0d8] shadow-sm">
          <div className="p-6 border-b border-[#e5e0d8]">
            <h3 className="font-bold text-lg text-[#2d2a26]">Cash Flow Trend</h3>
          </div>
          <CardContent className="p-6">
            <div style={{ width: '100%', height: 400 }} className="min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e0d8" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8b8175'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#8b8175'}} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
              <tr className="bg-[#fcfbf9] border-b border-[#e5e0d8]">
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Invoice / Project</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Client</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Total (inc. GST)</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e0d8]">
              {finance.invoices.map(inv => (
                <tr key={inv._id} className="hover:bg-[#f5f5f0]/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#2d2a26]">{inv.invoiceNumber}</p>
                    <p className="text-xs text-[#8b8175]">{inv.projectName || 'Consultation'}</p>
                  </td>
                  <td className="p-4 font-medium text-[#2d2a26]">{inv.clientName}</td>
                  <td className="p-4 font-bold text-[#2d2a26]">₹{inv.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-sm text-[#8b8175]">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${
                      inv.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                      inv.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
              <tr className="bg-[#fcfbf9] border-b border-[#e5e0d8]">
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Description</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e0d8]">
              {finance.expenses.map(exp => (
                <tr key={exp._id} className="hover:bg-[#f5f5f0]/50 transition-colors">
                  <td className="p-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-[#f5f5f0] text-[#8b8175] rounded-full">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[#2d2a26]">{exp.description}</p>
                    {exp.vendorName && <p className="text-xs text-[#8b8175] flex items-center gap-1"><Briefcase className="w-3 h-3"/> {exp.vendorName}</p>}
                  </td>
                  <td className="p-4 font-bold text-red-600">-₹{exp.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${
                      exp.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
