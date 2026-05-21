import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PenTool, 
  FolderKanban, 
  Megaphone, 
  ShoppingBag, 
  FileText, 
  CalendarDays, 
  Truck, 
  CreditCard, 
  BarChart3, 
  LifeBuoy, 
  Bell,
  Box,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Designers', path: '/admin/designers', icon: PenTool },
  { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { name: 'Leads', path: '/admin/leads', icon: Megaphone },
  { name: 'Catalog', path: '/admin/products', icon: ShoppingBag },
  { name: 'CMS', path: '/admin/cms', icon: FileText },
  { name: 'Appointments', path: '/admin/appointments', icon: CalendarDays },
  { name: 'Vendors', path: '/admin/vendors', icon: Truck },
  { name: 'Finance', path: '/admin/finance', icon: CreditCard },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Support', path: '/admin/support', icon: LifeBuoy },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-[#fbfbf9] border-r border-[#e6e6df] text-[#1a1a1a] flex flex-col flex-shrink-0
      transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
      ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#e6e6df]">
        <Link to="/" className="text-xl font-bold font-playfair uppercase tracking-widest text-[#1a1a1a] hover:opacity-80 transition-opacity">SNS Nest</Link>
        <button className="lg:hidden text-[#8b8175] hover:text-[#1a1a1a]" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen && setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-[#1a1a1a] text-[#fbfbf9]' 
                      : 'text-[#8b8175] hover:bg-[#f5f5f0] hover:text-[#1a1a1a]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-[#e6e6df]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#d4cfc5] flex items-center justify-center text-xs font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-[#8b8175]">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
