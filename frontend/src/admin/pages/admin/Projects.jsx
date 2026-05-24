import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { adminApi } from '../../services/mockApi';
import { Search, FolderKanban, Calendar, Clock } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = React.useState(null);

  React.useEffect(() => {
    adminApi.getProjects().then(setProjects);
  }, []);

  if (!projects) return <div className="animate-pulse text-[#8b8175]">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#1a1a1a]">Project Management</h1>
          <p className="text-[#8b8175] mt-1">Track active projects, deadlines, and designer assignments.</p>
        </div>
        <Button className="gap-2">
          <FolderKanban className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <div className="flex items-center justify-between bg-[#fbfbf9] p-4 rounded-xl border border-[#e6e6df]">
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="bg-[#1a1a1a] text-[#fbfbf9]">All Projects</Button>
          <Button variant="ghost">Consultation</Button>
          <Button variant="ghost">Design Phase</Button>
          <Button variant="ghost">Execution</Button>
          <Button variant="ghost">Completed</Button>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8175]" />
          <Input className="pl-9" placeholder="Search projects..." />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:border-[#d4cfc5] transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={project.status === 'execution' ? 'warning' : 'outline'} className="capitalize">
                  {project.status.replace('-', ' ')}
                </Badge>
                <span className="text-sm font-medium font-mono text-[#8b8175]">{project.id}</span>
              </div>
              
              <h3 className="text-xl font-bold font-playfair text-[#1a1a1a] mb-2">{project.client}'s Residence</h3>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8b8175]">Designer</span>
                  <span className="font-medium text-[#1a1a1a]">{project.designer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8b8175]">Value</span>
                  <span className="font-medium text-[#1a1a1a]">₹{project.value.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#8b8175] mt-4 pt-4 border-t border-[#e6e6df]">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: <span className="text-[#1a1a1a] font-medium">{project.deadline}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
