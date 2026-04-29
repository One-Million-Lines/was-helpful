import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <ThumbsUp className="h-12 w-12 text-muted-foreground mx-auto opacity-30" />
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
