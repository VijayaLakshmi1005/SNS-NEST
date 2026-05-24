import React, { useEffect, useState } from 'react';
import CRMOverview from './components/CRMOverview';
import CRMClientTable from './components/CRMClientTable';
import ClientFormDialog from './components/ClientFormDialog';
import ClientDrawer from './components/ClientDrawer';
import { Button } from '../../../components/ui/Button';
import { UserPlus } from 'lucide-react';
import { useCrmStore } from '../../../../store/useCrmStore';
// import { io } from 'socket.io-client';

export default function CRMWorkspace() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { setFilter } = useCrmStore();
  
  useEffect(() => {
    // const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    //   auth: { token: localStorage.getItem('accessToken') }
    // });
    
    // socket.on('crm:client_updated', (data) => {
    //   // Invalidate queries or update store
    // });

    // return () => socket.disconnect();
  }, []);

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#1a1a1a]">CRM Workspace</h1>
          <p className="text-[#8b8175] mt-1">Realtime enterprise client relationship management.</p>
        </div>
        <Button 
          className="gap-2, bg-[#1a1a1a] hover:bg-[#333] text-white"
          onClick={() => setIsFormOpen(true)}
        >
          <UserPlus className="w-4 h-4" />
          New Lead
        </Button>
      </div>

      <CRMOverview />
      <CRMClientTable />
      
      <ClientFormDialog 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => setFilter('refresh', Date.now())}
      />
      
      <ClientDrawer />
    </div>
  );
}
