import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThumbsUp, LogOut, Settings } from 'lucide-react';

interface AppHeaderProps {
  projectName?: string;
  projectId?: string;
}

export default function AppHeader({ projectName, projectId }: AppHeaderProps) {
  const { email, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <ThumbsUp className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">WasHelpful</span>
          </Link>
          {projectName && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground truncate">{projectName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {projectId && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/project/${projectId}/config`}>
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground hidden sm:block">{email}</span>
          <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
