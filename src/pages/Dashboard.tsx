import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { api } from '@/services/apiClient';
import type { WHProject } from '@/types';
import { DEFAULT_CONFIG } from '@/types';
import { Plus, ThumbsUp, ThumbsDown, MessageSquare, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: () => api.createProject({ name: newName, description: newDesc, config: DEFAULT_CONFIG }),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setNewOpen(false);
      setNewName('');
      setNewDesc('');
      navigate(`/project/${project._id}`);
    },
    onError: () => toast.error('Failed to create project'),
  });

  const projects: WHProject[] = data?.projects ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Each project has its own widget embed and feedback stream.</p>
          </div>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New project
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <ThumbsUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No projects yet</p>
            <p className="text-sm mt-1">Create your first project to start collecting feedback.</p>
            <Button className="mt-6" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New project
            </Button>
          </div>
        )}

        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Card key={project._id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription className="text-sm line-clamp-2">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
                      {project.stats?.upVotes ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-3.5 w-3.5 text-red-400" />
                      {project.stats?.downVotes ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {project.stats?.totalFeedback ?? 0}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full group-hover:border-primary/50">
                    <Link to={`/project/${project._id}`}>
                      View feedback
                      <ArrowRight className="h-3.5 w-3.5 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="proj-name">Name</Label>
              <Input
                id="proj-name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Help Center, Support Bot…"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proj-desc">Description (optional)</Label>
              <Input
                id="proj-desc"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Where will this widget be embedded?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
