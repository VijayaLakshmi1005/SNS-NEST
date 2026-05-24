import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/Table';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { useCrmStore } from '../../../../../store/useCrmStore';
import ClientFormDialog from './ClientFormDialog';

export default function CRMClientTable() {
  const { filters, setFilter, openClientDrawer } = useCrmStore();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const authStorageStr = localStorage.getItem('auth-storage');
        const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
        const queryParams = new URLSearchParams({
          page: 1,
          limit: 50,
          ...(filters.search && { search: filters.search }),
          ...(filters.status && { status: filters.status }),
          ...(filters.sort && { sort: filters.sort })
        });

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/crm/clients?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setClients(data.data.clients);
        }
      } catch (err) {
        console.error("Failed to fetch clients", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchClients, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Active Client': return 'bg-green-100 text-green-800';
      case 'Project Active': return 'bg-blue-100 text-blue-800';
      case 'New Lead': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this client?')) {
      try {
        const authStorageStr = localStorage.getItem('auth-storage');
        const token = authStorageStr ? JSON.parse(authStorageStr)?.state?.token : null;
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/crm/clients/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        // Invalidate or trigger refetch by tweaking filter reference
        setFilter('refresh', Date.now());
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Card className="border-[#e6e6df] shadow-sm">
      <CardHeader className="border-b border-[#e6e6df] pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl font-playfair">Client Directory</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8175]" />
              <Input 
                className="pl-9 bg-[#fcfcfb] border-[#e6e6df]" 
                placeholder="Search clients..." 
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select 
                className="border border-[#e6e6df] bg-white rounded-md text-xs font-bold p-2 text-[#1a1a1a] outline-none uppercase appearance-none pr-8 cursor-pointer tracking-wider"
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
              >
                <option value="">ALL STATUS</option>
                <option value="NEW">NEW</option>
                <option value="FOLLOW-UP">FOLLOW-UP</option>
                <option value="MEETING">MEETING</option>
                <option value="NEGOTIATION">NEGOTIATION</option>
                <option value="CONVERTED">CONVERTED</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8b8175]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            
            <div className="relative">
              <select 
                className="border border-[#e6e6df] bg-white rounded-md text-xs font-bold p-2 text-[#1a1a1a] outline-none uppercase appearance-none pr-8 cursor-pointer tracking-wider"
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
              >
                <option value="-createdAt">NEWEST FIRST</option>
                <option value="createdAt">OLDEST FIRST</option>
                <option value="fullName">NAME (A-Z)</option>
                <option value="-fullName">NAME (Z-A)</option>
                <option value="clientStatus">BY STATUS</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#8b8175]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-8m-4 8l-4-8" /></svg>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fcfcfb]">
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Designer</TableHead>
              <TableHead>Inquiry Date</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#8b8175]">Loading clients...</TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#8b8175]">No clients found.</TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow 
                  key={client._id} 
                  className="cursor-pointer hover:bg-[#fcfcfb] transition-colors"
                  onClick={() => openClientDrawer(client._id)}
                >
                  <TableCell>
                    <div className="font-medium text-[#1a1a1a]">{client.fullName}</div>
                    <div className="text-sm text-[#8b8175]">{client.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(client.clientStatus)}`}>
                      {client.clientStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#8b8175]">
                    {client.assignedDesigner ? client.assignedDesigner.fullName : 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium italic text-[#8b8175]">
                      {new Date(client.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="mt-1.5">
                      <span className={`inline-block px-2 py-0.5 border rounded uppercase text-[10px] font-bold tracking-wider ${
                        client.paymentStatus === 'PAID' 
                          ? 'border-green-200 text-green-600 bg-green-50/50' 
                          : 'border-red-200 text-red-500 bg-red-50/50'
                      }`}>
                        {client.paymentStatus || 'UNPAID'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">
                    ₹{(client.totalRevenue || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingClient(client); }}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => handleDelete(e, client._id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <ClientFormDialog 
        isOpen={!!editingClient} 
        onClose={() => setEditingClient(null)} 
        clientData={editingClient}
        onSuccess={() => { setEditingClient(null); setFilter('refresh', Date.now()); }}
      />
    </Card>
  );
}
