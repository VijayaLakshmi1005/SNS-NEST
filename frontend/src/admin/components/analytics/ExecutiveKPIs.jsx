import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Users, Briefcase, UserCheck, PhoneCall, TrendingUp } from 'lucide-react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';

export default function ExecutiveKPIs({ data }) {
  if (!data) return null;

  const { revenue, leads, projects, consultations, users } = data;

  const kpis = [
    {
      title: 'Total Revenue',
      value: revenue.total,
      prefix: '₹',
      icon: IndianRupee,
      color: 'text-amber-500',
      bg: 'bg-amber-100',
      subtitle: `+₹${revenue.currentMonth} this month`,
      link: '/admin/finance'
    },
    {
      title: 'Active Projects',
      value: projects.active,
      icon: Briefcase,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      subtitle: `${projects.completed} completed globally`,
      link: '/admin/projects'
    },
    {
      title: 'Total Leads',
      value: leads.total,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
      subtitle: `${leads.converted} successfully converted`,
      link: '/admin/leads'
    },
    {
      title: 'Active Clients',
      value: users.activeClients,
      icon: UserCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
      subtitle: `Out of ${users.clients} total registered`,
      link: '/admin/crm'
    },
    {
      title: 'Consultations',
      value: consultations.upcoming,
      icon: PhoneCall,
      color: 'text-orange-500',
      bg: 'bg-orange-100',
      subtitle: `${consultations.today} happening today`,
      link: '/admin/appointments'
    },
    {
      title: 'Designers',
      value: users.designers,
      icon: TrendingUp,
      color: 'text-indigo-500',
      bg: 'bg-indigo-100',
      subtitle: `Managing ${projects.active} active projects`,
      link: '/admin/users'
    }
  ];

  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
    >
      {kpis.map((kpi, index) => (
        <motion.div 
          key={index}
          variants={item}
          onClick={() => navigate(kpi.link)}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e0d8] hover:shadow-md transition-shadow hover:border-[#1a1a1a]/20 relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
          </div>
          <h3 className="text-sm font-bold text-[#8b8175] uppercase tracking-wider mb-2 relative z-10">{kpi.title}</h3>
          <div className="text-3xl font-extrabold text-[#2d2a26] mb-2 font-nav-style relative z-10">
            {kpi.prefix}
            <CountUp end={kpi.value} duration={2} separator="," />
          </div>
          <p className="text-xs text-[#8b8175] font-medium relative z-10">{kpi.subtitle}</p>
          
          {/* Subtle Hover Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white to-[#fcfbf9] opacity-0 group-hover:opacity-100 transition-opacity z-0" />
        </motion.div>
      ))}
    </motion.div>
  );
}
