import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Upload, Video, MessageSquare } from 'lucide-react';
import { cn } from '../../admin/components/ui/Card';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/designer/dashboard' },
  { icon: FolderKanban, label: 'Assigned Projects', href: '/designer/projects' },
  { icon: Upload, label: 'Upload Designs', href: '/designer/uploads' },
  { icon: Video, label: 'Meetings', href: '/designer/meetings' },
  { icon: MessageSquare, label: 'Messages', href: '/designer/messages' },
];

export default function DesignerSidebar() {
  return (
    <aside className="w-64 bg-[#fbfbf9] border-r border-[#e6e6df] flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[#e6e6df]">
        <span className="text-xl font-playfair font-bold text-[#1a1a1a] tracking-wide">
          DESIGNER<span className="text-[#8b8175] ml-1">PANEL</span>
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-[#eae8e3] text-[#1a1a1a]' 
                    : 'text-[#5a5550] hover:bg-[#f5f5f0] hover:text-[#1a1a1a]'
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-[#e6e6df]">
        <div className="bg-[#f5f5f0] rounded-xl p-4">
          <p className="text-xs font-medium text-[#5a5550] uppercase tracking-wider mb-2">Workspace Info</p>
          <div className="text-sm font-medium text-[#1a1a1a]">Lead Designer</div>
          <div className="text-xs text-[#8b8175] mt-0.5">SNS NEST Studio</div>
        </div>
      </div>
    </aside>
  );
}
