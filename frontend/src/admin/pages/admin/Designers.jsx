import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { adminApi } from '../../services/mockApi';
import { MoreHorizontal, Search, Star, PenTool } from 'lucide-react';

export default function Designers() {
  const [designers, setDesigners] = React.useState(null);

  React.useEffect(() => {
    adminApi.getDesigners().then(setDesigners);
  }, []);

  if (!designers) return <div className="animate-pulse text-[#8b8175]">Loading designers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#1a1a1a]">Designers</h1>
          <p className="text-[#8b8175] mt-1">Manage and track interior designer performance.</p>
        </div>
        <Button className="gap-2">
          <PenTool className="w-4 h-4" />
          Onboard Designer
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-[#e6e6df] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Active Designers</CardTitle>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8175]" />
              <Input className="pl-9" placeholder="Search designers..." />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designer Name</TableHead>
                <TableHead>Active Projects</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    <div>{d.name}</div>
                    <div className="text-xs text-[#8b8175] font-normal">{d.email}</div>
                  </TableCell>
                  <TableCell>{d.activeProjects}</TableCell>
                  <TableCell>{d.completedProjects}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="font-medium">{d.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₹{(d.revenue / 1000).toFixed(1)}k</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
