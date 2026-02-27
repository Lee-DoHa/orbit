import { getAccessToken } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const token = await getAccessToken();
    headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // Allow unauthenticated requests for seed endpoint
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
  }

  return res.json();
}

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  return entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

export const api = {
  entries: {
    list: (params?: { limit?: number; offset?: number }) =>
      request<any[]>(`/entries?${qs(params)}`),
    get: (id: string) => request<any>(`/entries/${id}`),
    create: (body: { emotionIds: number[]; intensity: number; contextTag?: string; note?: string }) =>
      request<any>('/entries', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/entries/${id}`, { method: 'DELETE' }),
  },
  mirror: {
    analyze: (entryId: string) =>
      request<{ understanding: string; structure: string; suggestion: string; question: string | null }>(
        '/mirror', { method: 'POST', body: JSON.stringify({ entryId }) }
      ),
  },
  insights: {
    weekly: () => request<any>('/insights/weekly'),
    patterns: () => request<any[]>('/insights/patterns'),
  },
  users: {
    me: () => request<any>('/users/me'),
    update: (body: { display_name?: string; persona?: string; timezone?: string }) =>
      request<any>('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  },
};
