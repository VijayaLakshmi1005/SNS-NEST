import React from 'react';
import { Outlet } from 'react-router-dom';
import DesignerSidebar from './DesignerSidebar';
import { Bell, Menu, Search } from 'lucide-react';
import { Input } from '../../admin/components/ui/Input';
import { Button } from '../../admin/components/ui/Button';

export default function DesignerLayout() {
  return (
    <div className="flex h-screen bg-[#f5f5f0] overflow-hidden font-neuemontreal">
      <DesignerSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-[#e6e6df] bg-[#fbfbf9] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative w-64 hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8175]" />
              <Input className="pl-9 bg-[#f5f5f0] border-transparent" placeholder="Search projects or designs..." />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-[#333333]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-900 rounded-full"></span>
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
