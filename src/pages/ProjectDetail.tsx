import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/services/apiClient';
import type { Vote, FeedbackItem } from '@/types';
import { ThumbsUp, ThumbsDown, MessageSquare, BarChart2, Code, ExternalLink } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [voteFilter, setVoteFilter] = useState<'all' | 'up' | 'down'>('all');

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id!),
    enabled: !!id,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => api.getAnalytics(id!),
    enabled: !!id,
  });

  const { data: votesData } = useQuery({
    queryKey: ['votes', id, voteFilter],
    queryFn: () => api.getVotes(id!, voteFilter === 'all' ? undefined : voteFilter),
    enabled: !!id,
  });

  const { data: feedbackData } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => api.getFeedback(id!),
    enabled: !!id,
  });

  const votes: Vote[] = votesData?.votes ?? [];
  const feedbackItems: FeedbackItem[] = feedbackData?.feedback ?? [];

  const helpfulnessRate = analytics?.helpfulnessRate ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader projectName={project?.name} projectId={id} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Helpfulness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{helpfulnessRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5 text-green-500" /> Helpful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{analytics?.upVotes ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <ThumbsDown className="h-3.5 w-3.5 text-red-400" /> Not helpful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{analytics?.downVotes ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{analytics?.totalFeedback ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Poll distribution */}
        {analytics && Object.keys(analytics.pollDistribution).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Poll responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.pollDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([label, count]) => {
                    const pct = analytics.totalFeedback > 0 ? Math.round((count / analytics.totalFeedback) * 100) : 0;
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">{label}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div className="flex gap-3 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/project/${id}/config`}>
              Configure widget
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/project/${id}/embed`}>
              <Code className="h-3.5 w-3.5 mr-1.5" />
              Embed instructions
            </Link>
          </Button>
        </div>

        {/* Feedback tabs */}
        <Tabs defaultValue="feedback">
          <TabsList>
            <TabsTrigger value="feedback">Text feedback</TabsTrigger>
            <TabsTrigger value="votes">All votes</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="mt-4">
            {feedbackItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No text feedback yet.</p>
            ) : (
              <div className="space-y-3">
                {feedbackItems.map(item => (
                  <Card key={item._id}>
                    <CardContent className="py-4">
                      {item.textInput && (
                        <p className="text-sm text-foreground mb-2">"{item.textInput}"</p>
                      )}
                      <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                        {item.pollAnswer && <span className="bg-muted px-2 py-0.5 rounded">{item.pollAnswer}</span>}
                        {item.pageUrl && (
                          <a href={item.pageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
                            <ExternalLink className="h-3 w-3" />
                            {item.pageUrl.replace(/^https?:\/\//, '').slice(0, 60)}
                          </a>
                        )}
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="votes" className="mt-4">
            <div className="flex gap-2 mb-4">
              {(['all', 'up', 'down'] as const).map(f => (
                <Button
                  key={f}
                  size="sm"
                  variant={voteFilter === f ? 'default' : 'outline'}
                  onClick={() => setVoteFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'up' ? '👍 Helpful' : '👎 Not helpful'}
                </Button>
              ))}
            </div>
            {votes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No votes yet.</p>
            ) : (
              <div className="space-y-2">
                {votes.map(v => (
                  <div key={v._id} className="flex items-center gap-3 text-sm py-2 border-b border-border last:border-0">
                    <span>{v.vote === 'up' ? '👍' : '👎'}</span>
                    <span className="text-muted-foreground flex-1 truncate">{v.pageUrl || '—'}</span>
                    <span className="text-muted-foreground text-xs">{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
