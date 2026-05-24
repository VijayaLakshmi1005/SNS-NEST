import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../services/mockApi';
import { Plus, MoreVertical, Calendar } from 'lucide-react';

const COLUMNS = ['New Lead', 'Contacted', 'Interested', 'Consultation Scheduled', 'Converted'];

export default function Leads() {
  const [leads, setLeads] = React.useState(null);

  React.useEffect(() => {
    adminApi.getLeads().then(setLeads);
  }, []);

  if (!leads) return <div className="animate-pulse text-[#8b8175]">Loading CRM pipeline...</div>;

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden pb-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#1a1a1a]">Lead Management</h1>
          <p className="text-[#8b8175] mt-1">Track and convert incoming design inquiries.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter(l => l.status === col);
          return (
            <div key={col} className="flex-shrink-0 w-80 flex flex-col bg-[#e6e6df]/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                <h3 className="font-semibold text-[#1a1a1a]">{col}</h3>
                <span className="bg-[#d4cfc5] text-[#1a1a1a] text-xs font-bold px-2 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                {colLeads.map((lead) => (
                  <Card key={lead.id} className="cursor-pointer hover:border-[#8b8175] transition-colors shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-[#8b8175] uppercase">{lead.source}</span>
                        <button className="text-[#8b8175] hover:text-[#1a1a1a]">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-bold text-[#1a1a1a] text-lg leading-tight mb-1">{lead.name}</h4>
                      <p className="text-[#8b8175] text-sm font-medium mb-3">Est. Value: ₹{lead.value.toLocaleString()}</p>
                      <div className="flex items-center text-xs text-[#8b8175] pt-3 border-t border-[#e6e6df]">
                        <Calendar className="w-3 h-3 mr-1" />
                        {lead.date}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {colLeads.length === 0 && (
                  <div className="text-center p-4 border-2 border-dashed border-[#d4cfc5] rounded-xl text-[#8b8175] text-sm">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
