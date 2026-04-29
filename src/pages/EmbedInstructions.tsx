import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/apiClient';
import { toast } from 'sonner';
import { Copy, ArrowLeft } from 'lucide-react';

const API_CDN = import.meta.env.VITE_API_BASE ?? 'https://api.washelpful.com';

export default function EmbedInstructions() {
  const { id } = useParams<{ id: string }>();

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id!),
    enabled: !!id,
  });

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'));
  }

  const scriptEmbed = `<script src="${API_CDN}/widget.js"></script>
<script>
  WasHelpful.init({
    projectId: "${id}",
  });
</script>`;

  const inlineEmbed = `<div id="was-helpful"></div>
<script src="${API_CDN}/widget.js"></script>
<script>
  WasHelpful.mount("#was-helpful", { projectId: "${id}" });
</script>`;

  const reactEmbed = `import { WasHelpfulWidget } from '@washelpful/react';

<WasHelpfulWidget projectId="${id}" />`;

  const blocks = [
    {
      title: 'Option A — Script embed (recommended)',
      description: 'Drop this snippet before your closing </body> tag.',
      code: scriptEmbed,
    },
    {
      title: 'Option B — Inline mount',
      description: 'Place the div where you want the widget, then load the script.',
      code: inlineEmbed,
    },
    {
      title: 'Option C — React component',
      description: 'For React apps, install @washelpful/react and use the component.',
      code: reactEmbed,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader projectName={project?.name} projectId={id} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/project/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Embed instructions</h1>
            <p className="text-sm text-muted-foreground">Add the WasHelpful widget to any page in minutes.</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Your project ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="text-sm bg-muted px-3 py-2 rounded font-mono flex-1">{id}</code>
              <Button size="sm" variant="outline" onClick={() => copy(id!)}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {blocks.map(block => (
            <Card key={block.title}>
              <CardHeader>
                <CardTitle className="text-sm">{block.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{block.description}</p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted text-sm p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
                    {block.code}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copy(block.code)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-muted">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Optional overrides:</strong> Pass <code className="bg-muted px-1 rounded text-xs">overrideConfig</code> to the init call to override any config values client-side without changing the server settings.
            </p>
            <pre className="text-xs bg-muted mt-3 p-3 rounded font-mono">
{`WasHelpful.init({
  projectId: "${id}",
  userId: "optional-user-id",
  metadata: { page: "help-article-123" },
  overrideConfig: {
    questionText: "Did this help?",
  },
  onVote: (vote) => console.log("voted:", vote),
  onSubmit: (feedback) => console.log("feedback:", feedback),
});`}
            </pre>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
