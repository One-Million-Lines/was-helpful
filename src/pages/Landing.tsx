import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WidgetPreview from '@/components/WidgetPreview';
import { DEFAULT_CONFIG } from '@/types';
import { ThumbsUp, Code, Zap, BarChart2 } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-primary" />
            <span className="font-semibold">WasHelpful</span>
          </div>
          <Button asChild size="sm">
            <Link to="/">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Did it actually help?
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            One-click feedback widget for help articles, support answers, and chat responses.
            Thumbs up. Thumbs down. That's it.
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/">Get started free</Link>
            </Button>
          </div>
        </div>

        {/* Demo widget */}
        <div className="flex justify-center mb-20">
          <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
            <p className="text-sm text-muted-foreground mb-4 text-center">Live preview</p>
            <WidgetPreview config={DEFAULT_CONFIG} state="idle" />
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="h-6 w-6 text-primary" />,
              title: 'One snippet',
              desc: 'Drop a single script tag. The widget loads your config, handles the UI, and sends data automatically.',
            },
            {
              icon: <Code className="h-6 w-6 text-primary" />,
              title: 'Zero style conflicts',
              desc: 'Shadow DOM isolation keeps your page styles and the widget completely separate.',
            },
            {
              icon: <BarChart2 className="h-6 w-6 text-primary" />,
              title: 'Actionable insights',
              desc: 'Helpfulness rate, poll distribution, and free-text feedback all in one place.',
            },
          ].map(f => (
            <div key={f.title} className="space-y-3">
              {f.icon}
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
