import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppHeader from '@/components/AppHeader';
import WidgetPreview from '@/components/WidgetPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { api } from '@/services/apiClient';
import type { WHConfig } from '@/types';
import { DEFAULT_CONFIG } from '@/types';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

type PreviewState = 'idle' | 'voted_up' | 'voted_down' | 'submitted';

export default function ProjectConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id!),
    enabled: !!id,
  });

  const [config, setConfig] = useState<WHConfig>(DEFAULT_CONFIG);
  const [previewState, setPreviewState] = useState<PreviewState>('idle');
  const [newPollOption, setNewPollOption] = useState('');

  useEffect(() => {
    if (project?.config) {
      setConfig({ ...DEFAULT_CONFIG, ...project.config, theme: { ...DEFAULT_CONFIG.theme, ...project.config.theme } });
    }
  }, [project]);

  const saveMutation = useMutation({
    mutationFn: () => api.updateConfig(id!, config),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Configuration saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  function set<K extends keyof WHConfig>(key: K, value: WHConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  function setTheme<K extends keyof WHConfig['theme']>(key: K, value: WHConfig['theme'][K]) {
    setConfig(prev => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
  }

  function addPollOption() {
    const opt = newPollOption.trim();
    if (!opt || config.pollOptions.includes(opt)) return;
    set('pollOptions', [...config.pollOptions, opt]);
    setNewPollOption('');
  }

  function removePollOption(idx: number) {
    set('pollOptions', config.pollOptions.filter((_, i) => i !== idx));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader projectName={project?.name} projectId={id} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Widget Configuration</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Changes are reflected in the live preview instantly.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/project/${id}`)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Config panels */}
          <div>
            <Tabs defaultValue="widget">
              <TabsList className="mb-4">
                <TabsTrigger value="widget">Widget</TabsTrigger>
                <TabsTrigger value="followup">Follow-up</TabsTrigger>
                <TabsTrigger value="theme">Theme</TabsTrigger>
              </TabsList>

              <TabsContent value="widget" className="space-y-5">
                <div className="space-y-2">
                  <Label>Question text</Label>
                  <Input value={config.questionText} onChange={e => set('questionText', e.target.value)} placeholder="Was this helpful?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Positive label</Label>
                    <Input value={config.positiveLabel} onChange={e => set('positiveLabel', e.target.value)} placeholder="Yes, helpful" />
                  </div>
                  <div className="space-y-2">
                    <Label>Negative label</Label>
                    <Input value={config.negativeLabel} onChange={e => set('negativeLabel', e.target.value)} placeholder="Not helpful" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Thank you message</Label>
                  <Input value={config.thankYouMessage} onChange={e => set('thankYouMessage', e.target.value)} placeholder="Thanks for your feedback!" />
                </div>
                <div className="space-y-2">
                  <Label>Display mode</Label>
                  <Select value={config.displayMode} onValueChange={v => set('displayMode', v as WHConfig['displayMode'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inline">Inline block</SelectItem>
                      <SelectItem value="compact">Compact inline</SelectItem>
                      <SelectItem value="modal">Modal / popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="followup" className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable follow-up</p>
                    <p className="text-xs text-muted-foreground">Ask for more details after a thumbs down</p>
                  </div>
                  <Switch checked={config.followUpEnabled} onCheckedChange={v => set('followUpEnabled', v)} />
                </div>

                {config.followUpEnabled && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Follow-up question</Label>
                      <Input value={config.followUpQuestion} onChange={e => set('followUpQuestion', e.target.value)} placeholder="What could be improved?" />
                    </div>
                    <div className="space-y-2">
                      <Label>Follow-up type</Label>
                      <Select value={config.followUpType} onValueChange={v => set('followUpType', v as WHConfig['followUpType'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="textarea">Free text</SelectItem>
                          <SelectItem value="poll">Poll options</SelectItem>
                          <SelectItem value="poll_with_input">Poll + text input</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(config.followUpType === 'poll' || config.followUpType === 'poll_with_input') && (
                      <div className="space-y-2">
                        <Label>Poll options</Label>
                        <div className="space-y-2">
                          {config.pollOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input value={opt} onChange={e => {
                                const updated = [...config.pollOptions];
                                updated[idx] = e.target.value;
                                set('pollOptions', updated);
                              }} />
                              <Button size="icon" variant="ghost" onClick={() => removePollOption(idx)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              value={newPollOption}
                              onChange={e => setNewPollOption(e.target.value)}
                              placeholder="Add option…"
                              onKeyDown={e => e.key === 'Enter' && addPollOption()}
                            />
                            <Button size="icon" variant="outline" onClick={addPollOption}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="theme" className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary color</Label>
                    <div className="flex gap-2">
                      <input type="color" value={config.theme.primaryColor} onChange={e => setTheme('primaryColor', e.target.value)} className="h-9 w-12 rounded border border-input cursor-pointer" />
                      <Input value={config.theme.primaryColor} onChange={e => setTheme('primaryColor', e.target.value)} className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background color</Label>
                    <div className="flex gap-2">
                      <input type="color" value={config.theme.backgroundColor} onChange={e => setTheme('backgroundColor', e.target.value)} className="h-9 w-12 rounded border border-input cursor-pointer" />
                      <Input value={config.theme.backgroundColor} onChange={e => setTheme('backgroundColor', e.target.value)} className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text color</Label>
                    <div className="flex gap-2">
                      <input type="color" value={config.theme.textColor} onChange={e => setTheme('textColor', e.target.value)} className="h-9 w-12 rounded border border-input cursor-pointer" />
                      <Input value={config.theme.textColor} onChange={e => setTheme('textColor', e.target.value)} className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Border radius</Label>
                    <Input value={config.theme.borderRadius} onChange={e => setTheme('borderRadius', e.target.value)} placeholder="8px" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Button style</Label>
                  <Select value={config.theme.buttonStyle} onValueChange={v => setTheme('buttonStyle', v as 'filled' | 'outline')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Live preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap mb-4">
                  {(['idle', 'voted_up', 'voted_down', 'submitted'] as PreviewState[]).map(s => (
                    <Button key={s} size="sm" variant={previewState === s ? 'default' : 'outline'} onClick={() => setPreviewState(s)}>
                      {s === 'idle' ? 'Default' : s === 'voted_up' ? 'After 👍' : s === 'voted_down' ? 'After 👎' : 'Submitted'}
                    </Button>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center min-h-[120px]">
                  <WidgetPreview config={config} state={previewState} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
