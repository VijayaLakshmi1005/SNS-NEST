import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Star } from 'lucide-react';

export default function TopDesigners({ data }) {
  if (!data) return <div className="animate-pulse h-64 bg-[#e6e6df] rounded-xl"></div>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Performing Designers</CardTitle>
        <CardDescription>Ranked by revenue contribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-sm text-[#8b8175]">No designers found.</div>
          ) : (
            data.slice(0, 5).map((designer, i) => (
              <div key={designer._id} className="flex items-center justify-between p-3 bg-[#fbfbf9] rounded-lg border border-[#e6e6df]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e6e6df] overflow-hidden">
                    {designer.profileImage ? (
                      <img src={designer.profileImage} alt={designer.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#8b8175]">
                        {designer.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1a1a1a]">{designer.fullName}</h4>
                    <p className="text-xs text-[#8b8175] flex items-center">
                      {designer.completedProjects} projects completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#1a1a1a]">₹{(designer.revenue / 1000).toFixed(1)}k</div>
                  <div className="text-[10px] text-[#8b8175]">Generated</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
