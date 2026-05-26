import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  DollarSign, FileText, Download, TrendingUp, TrendingDown, RefreshCw, 
  Briefcase, Plus, CheckCircle2, AlertCircle, Activity, CreditCard, Receipt, 
  Wallet, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function FinanceDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const socket = io(API_URL.replace('/api', ''), { withCredentials: true, transports: ['websocket', 'polling'] });
    
    socket.on('financeUpdated', () => {
      queryClient.invalidateQueries(['financeOverview']);
    });
    
    socket.on('payment:success', (data) => {
      // Optimistically trigger a refetch but we could also inject data
      queryClient.invalidateQueries(['financeOverview']);
    });

    socket.on('activity:new', () => {
      queryClient.invalidateQueries(['financeOverview']);
    });

    return () => socket.disconnect();
  }, [queryClient]);

  const { data: finance, isLoading, refetch } = useQuery({
    queryKey: ['financeOverview'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/finance/overview`, { withCredentials: true });
      return res.data.data;
    },
    staleTime: 60000
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'expenses', label: 'Procurement', icon: Briefcase },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  if (isLoading || !finance) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#e5e0d8] border-t-[#2d2a26] rounded-full animate-spin"></div>
        <p className="text-[#8b8175] font-medium animate-pulse">Syncing Enterprise Ledger...</p>
      </div>
    );
  }

  const { kpis, chartData, activityFeed, invoices, expenses, payments, commissions } = finance;

  // Variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-24 overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-nav-style font-extrabold text-[#2d2a26] tracking-tight">Finance OS</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-md border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-[#8b8175] text-lg max-w-xl">Real-time luxury revenue, automated billing, and procurement tracking.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleManualRefresh}
            className="flex items-center justify-center w-11 h-11 bg-white border border-[#e5e0d8] text-[#2d2a26] rounded-xl hover:bg-[#fcfbf9] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e5e0d8] text-[#2d2a26] rounded-xl font-bold hover:bg-[#fcfbf9] transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#2d2a26] text-[#fcfbf9] rounded-xl font-bold hover:bg-black hover:shadow-lg transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-[#f5f4f0] rounded-2xl overflow-x-auto scrollbar-hide border border-[#e5e0d8]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white text-[#2d2a26] shadow-sm ring-1 ring-black/5' 
                  : 'text-[#8b8175] hover:text-[#2d2a26] hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2d2a26]' : 'text-[#a8a096]'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                          <TrendingUp className="w-3 h-3 mr-1"/> +12%
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-1">Total Revenue</p>
                      <p className="text-4xl font-extrabold text-[#2d2a26] font-nav-style">₹{(kpis.totalRevenue/100000).toFixed(2)}<span className="text-xl text-[#8b8175]">L</span></p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-1">Pending Dues</p>
                      <p className="text-4xl font-extrabold text-[#2d2a26] font-nav-style">₹{(kpis.pendingDues/100000).toFixed(2)}<span className="text-xl text-[#8b8175]">L</span></p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow h-full relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                          <TrendingDown className="w-6 h-6" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-1">Total Expenses</p>
                      <p className="text-4xl font-extrabold text-[#2d2a26] font-nav-style">₹{(kpis.totalExpenses/100000).toFixed(2)}<span className="text-xl text-[#8b8175]">L</span></p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="bg-white border-[#e5e0d8] shadow-sm hover:shadow-md transition-shadow h-full bg-gradient-to-br from-[#2d2a26] to-[#1a1815] text-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                          <DollarSign className="w-6 h-6" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[#d0cac3] uppercase tracking-wider mb-1">Net Profit</p>
                      <p className="text-4xl font-extrabold text-white font-nav-style">₹{(kpis.netProfit/100000).toFixed(2)}<span className="text-xl text-[#8b8175]">L</span></p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Middle Section: Mini Chart & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cash Flow Preview */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <Card className="bg-white border-[#e5e0d8] shadow-sm h-[400px] flex flex-col">
                    <div className="p-6 border-b border-[#e5e0d8] flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg text-[#2d2a26]">Cash Flow Trend</h3>
                        <p className="text-sm text-[#8b8175]">Last 6 months trajectory</p>
                      </div>
                      <button onClick={()=>setActiveTab('analytics')} className="text-sm font-bold text-[#2d2a26] hover:underline flex items-center">
                        Full Report <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    <div className="p-6 flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8b8175', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#8b8175', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e0d8', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value) => [`₹${value.toLocaleString(undefined, {maximumFractionDigits:0})}`, '']}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>

                {/* Live Activity Feed */}
                <motion.div variants={itemVariants}>
                  <Card className="bg-white border-[#e5e0d8] shadow-sm h-[400px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2d2a26] to-transparent opacity-20"></div>
                    <div className="p-6 border-b border-[#e5e0d8] flex justify-between items-center bg-white sticky top-0 z-10">
                      <div>
                        <h3 className="font-bold text-lg text-[#2d2a26] flex items-center gap-2">
                          Activity Feed
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                        </h3>
                        <p className="text-sm text-[#8b8175]">Live ledger events</p>
                      </div>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 scrollbar-hide space-y-6">
                      {activityFeed.length === 0 ? (
                        <p className="text-center text-[#8b8175] text-sm mt-10">No recent activity.</p>
                      ) : (
                        <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#e5e0d8] before:to-transparent">
                          {activityFeed.map((log, idx) => (
                            <motion.div 
                              key={log._id} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6"
                            >
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                {log.type === 'Payment' && <CreditCard className="w-4 h-4 text-green-500" />}
                                {log.type === 'Invoice' && <Receipt className="w-4 h-4 text-blue-500" />}
                                {log.type === 'Expense' && <TrendingDown className="w-4 h-4 text-red-500" />}
                                {log.type === 'System' && <ShieldCheck className="w-4 h-4 text-[#2d2a26]" />}
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[#e5e0d8] bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-bold text-[#2d2a26] text-sm">{log.title}</div>
                                </div>
                                <div className="text-[#8b8175] text-xs leading-relaxed">{log.description}</div>
                                <div className="text-[10px] font-bold text-[#a8a096] mt-2 uppercase tracking-wide">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>

              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <Card className="bg-white border-[#e5e0d8] shadow-sm">
                 <div className="p-6 border-b border-[#e5e0d8]">
                   <h3 className="font-bold text-xl text-[#2d2a26]">Comprehensive Revenue & Profitability</h3>
                 </div>
                 <CardContent className="p-8">
                   <div className="h-[500px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8b8175', fontSize: 13}} dy={15} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#8b8175', fontSize: 13}} dx={-15} tickFormatter={(val) => `₹${val/1000}k`} />
                          <RechartsTooltip 
                            cursor={{fill: '#fcfbf9'}}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e0d8', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value) => [`₹${value.toLocaleString(undefined, {maximumFractionDigits:0})}`, '']}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="revenue" name="Total Revenue" fill="#4ade80" radius={[6, 6, 0, 0]} maxBarSize={50} />
                          <Bar dataKey="expense" name="Procurement & Expenses" fill="#f87171" radius={[6, 6, 0, 0]} maxBarSize={50} />
                          <Bar dataKey="profit" name="Net Profit" fill="#2d2a26" radius={[6, 6, 0, 0]} maxBarSize={50} />
                        </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Card className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-[#fcfbf9] border-b border-[#e5e0d8]">
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Invoice Details</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Client / Project</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Billed Amount</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Amount Paid</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Due Date</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e0d8]">
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-[#fcfbf9] transition-colors group">
                          <td className="p-5">
                            <div className="font-bold text-[#2d2a26] flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-[#8b8175]" />
                              {inv.invoiceNumber}
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-[#2d2a26]">{inv.clientName}</div>
                            <div className="text-xs text-[#8b8175] mt-0.5">{inv.projectName || 'Consultation'}</div>
                          </td>
                          <td className="p-5 font-bold text-[#2d2a26]">₹{inv.totalAmount.toLocaleString()}</td>
                          <td className="p-5 font-bold text-green-600">
                            {inv.amountPaid > 0 ? `₹${inv.amountPaid.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-5 text-sm text-[#8b8175]">
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-5 text-right">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                              inv.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                              inv.status === 'Partial' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              inv.status === 'Sent' ? 'bg-amber-50 text-amber-700 border-amber-200' :
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
              </Card>
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Card className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#fcfbf9] border-b border-[#e5e0d8]">
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Category</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Description / Vendor</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Date</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Amount</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e0d8]">
                      {expenses.map((exp) => (
                        <tr key={exp._id} className="hover:bg-[#fcfbf9] transition-colors">
                          <td className="p-5">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-[#f5f5f0] border border-[#e5e0d8] text-[#8b8175] rounded-md">
                              {exp.category}
                            </span>
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-[#2d2a26]">{exp.description}</div>
                            {exp.vendorName && (
                              <div className="text-xs text-[#8b8175] mt-1 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> {exp.vendorName}
                              </div>
                            )}
                          </td>
                          <td className="p-5 text-sm text-[#8b8175]">
                            {new Date(exp.date).toLocaleDateString()}
                          </td>
                          <td className="p-5 font-bold text-red-600">-₹{exp.amount.toLocaleString()}</td>
                          <td className="p-5 text-right">
                            <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                              exp.status === 'Paid' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {exp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Card className="bg-white rounded-2xl border border-[#e5e0d8] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#e5e0d8] bg-gradient-to-r from-[#f5f4f0] to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#2d2a26]">Payment Gateway Logs</h3>
                      <p className="text-sm text-[#8b8175]">Razorpay Transaction Verification History</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-white border-b border-[#e5e0d8]">
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Receipt ID</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Client</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Method</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Date</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider">Amount</th>
                        <th className="p-5 text-xs font-bold text-[#8b8175] uppercase tracking-wider text-right">Gateway Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e0d8]">
                      {payments.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-[#8b8175]">No payment transactions found.</td></tr>
                      ) : (
                        payments.map((pay) => (
                          <tr key={pay._id} className="hover:bg-[#fcfbf9] transition-colors">
                            <td className="p-5 font-mono text-xs text-[#2d2a26] bg-[#fcfbf9] rounded-md m-2 block w-fit border border-[#e5e0d8]">
                              {pay.receiptId}
                            </td>
                            <td className="p-5 font-bold text-[#2d2a26]">{pay.clientName}</td>
                            <td className="p-5">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-[#8b8175]">
                                {pay.method === 'Card' ? <CreditCard className="w-4 h-4"/> : <Wallet className="w-4 h-4"/>}
                                {pay.method}
                              </span>
                            </td>
                            <td className="p-5 text-sm text-[#8b8175]">{new Date(pay.createdAt).toLocaleDateString()}</td>
                            <td className="p-5 font-bold text-[#2d2a26]">₹{pay.amount.toLocaleString()}</td>
                            <td className="p-5 text-right">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                                pay.status === 'Captured' ? 'bg-green-50 text-green-700 border-green-200' :
                                pay.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {pay.status === 'Captured' && <CheckCircle2 className="w-3 h-3" />}
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
