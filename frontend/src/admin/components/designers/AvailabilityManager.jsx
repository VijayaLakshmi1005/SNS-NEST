import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar } from 'lucide-react';

export default function AvailabilityManager({ initialAvailability = [] }) {
  if (initialAvailability.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#8b8175]" /> Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#8b8175] text-center py-4">No availability schedule set.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-[#e5e0d8] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#8b8175]" /> Weekly Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {initialAvailability.map((schedule, idx) => (
            <div key={idx} className="border-b border-[#e5e0d8] pb-3 last:border-0 last:pb-0">
              <h4 className="font-bold text-sm text-[#2d2a26] mb-2">{schedule.day}</h4>
              <div className="flex flex-wrap gap-2">
                {schedule.slots.map((slot, sIdx) => (
                  <span key={sIdx} className="px-2 py-1 bg-[#fcfbf9] border border-[#e5e0d8] text-xs rounded-md text-[#2d2a26]">
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
