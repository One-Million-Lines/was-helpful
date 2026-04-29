import type { WHProject, WHConfig, Vote, FeedbackItem, Analytics } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE;
const STORAGE_KEY = 'wh_auth';

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw).token ?? null;
  } catch { /* ignore */ }
  return null;
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...headers, ...(opts.headers as Record<string, string> || {}) } });
  if (res.status === 401) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  // Projects
  getProjects: () => req<{ projects: WHProject[] }>('/projects'),
  getProject: (id: string) => req<WHProject>(`/projects/${id}`),
  createProject: (data: Partial<WHProject>) =>
    req<WHProject>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<WHProject>) =>
    req<WHProject>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateConfig: (id: string, config: WHConfig) =>
    req<{ _id: string; config: WHConfig }>(`/projects/${id}/config`, { method: 'PUT', body: JSON.stringify(config) }),
  deleteProject: (id: string) =>
    req<{ deleted: boolean }>(`/projects/${id}`, { method: 'DELETE' }),

  // Feedback admin
  getVotes: (projectId: string, vote?: string, limit = 50, start = 0) => {
    const params = new URLSearchParams({ project_id: projectId, limit: String(limit), start: String(start) });
    if (vote) params.set('vote', vote);
    return req<{ votes: Vote[]; total: number }>(`/feedback/votes?${params}`);
  },
  getFeedback: (projectId: string, limit = 50, start = 0) => {
    const params = new URLSearchParams({ project_id: projectId, limit: String(limit), start: String(start) });
    return req<{ feedback: FeedbackItem[]; total: number }>(`/feedback/responses?${params}`);
  },
  getAnalytics: (projectId: string) =>
    req<Analytics>(`/feedback/analytics?project_id=${projectId}`),
};
