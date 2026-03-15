import { getAccessToken } from './auth';
import { EMOTIONS, CONTEXTS } from './constants';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

const EMOTION_MAP = Object.fromEntries(EMOTIONS.map((e) => [e.id, e.name]));
const CONTEXT_MAP = Object.fromEntries(CONTEXTS.map((c) => [c.id, c.name]));
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

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

// --- Data transformers ---

function transformEntry(raw: any) {
  const d = new Date(raw.recorded_at);
  const emotions = (raw.emotion_ids || []).map((id: number) => EMOTION_MAP[id] || `감정${id}`);
  const context = CONTEXT_MAP[raw.context_tag] || raw.context_tag || '-';
  const date = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  const dayOfWeek = DAY_LABELS[d.getDay()];

  const mirror =
    raw.understanding || raw.structure || raw.suggestion
      ? { understanding: raw.understanding, structure: raw.structure, suggestion: raw.suggestion, question: raw.question }
      : null;

  return {
    id: raw.id,
    date,
    dayOfWeek,
    emotions,
    intensity: raw.intensity,
    context,
    note: raw.note || null,
    mirror,
    mirrorSummary: raw.understanding ? raw.understanding.slice(0, 50) : '',
    recorded_at: raw.recorded_at,
  };
}

function transformWeekly(raw: any) {
  const topEmotion = raw.topEmotions?.[0]
    ? EMOTION_MAP[raw.topEmotions[0].emotionId] || '-'
    : '-';

  // Build weekly chart: map daily data to day labels
  const chartMap: Record<string, number> = {};
  (raw.daily || []).forEach((d: any) => {
    const date = new Date(d.day);
    const label = DAY_LABELS[date.getDay()];
    chartMap[label] = d.avgIntensity;
  });
  const weeklyChart = DAY_LABELS.slice(1).concat(DAY_LABELS[0]).map((day) => ({
    day,
    value: chartMap[day] || 0,
  }));

  // Top context from distribution
  const contextDist = raw.contextDistribution || {};
  const topContextKey = Object.keys(contextDist).sort((a, b) => contextDist[b] - contextDist[a])[0];
  const topContext = topContextKey ? (CONTEXT_MAP[topContextKey] || topContextKey) : '-';

  return {
    stabilityIndex: raw.stabilityIndex ?? 0,
    stabilityChange: raw.stabilityChange ?? 0,
    weeklyChart,
    topEmotion,
    avgIntensity: raw.avgIntensity ?? 0,
    topContext,
    entryCount: raw.entryCount ?? 0,
  };
}

function transformPatterns(raw: any[]) {
  return (raw || []).map((p) => {
    const emotionName = EMOTION_MAP[p.emotionId] || `감정${p.emotionId}`;
    const contextName = p.contextTag ? (CONTEXT_MAP[p.contextTag] || p.contextTag) : null;
    const description = contextName
      ? `${contextName} 상황에서 ${emotionName}을(를) ${p.count}회 느꼈어요`
      : `${emotionName}을(를) 최근 ${p.count}회 느꼈어요`;
    const suggestion = contextName
      ? `${contextName} 상황 전후로 감정을 기록해보면 패턴이 더 명확해질 수 있어요.`
      : `이 감정이 반복될 때의 상황을 함께 기록해보세요.`;
    return { description, suggestion };
  });
}

// --- API ---

export const api = {
  entries: {
    list: async (params?: { limit?: number; offset?: number }) => {
      const raw = await request<any[]>(`/entries?${qs(params)}`);
      return raw.map(transformEntry);
    },
    get: async (id: string) => {
      const raw = await request<any>(`/entries/${id}`);
      return transformEntry(raw);
    },
    create: (body: { emotionIds: number[]; intensity: number; contextTag?: string; note?: string }) =>
      request<any>('/entries', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/entries/${id}`, { method: 'DELETE' }),
    update: (id: string, body: { emotionIds?: number[]; intensity?: number; contextTag?: string; note?: string }) =>
      request<any>(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  },
  mirror: {
    analyze: (entryId: string) =>
      request<{ understanding: string; structure: string; suggestion: string; question: string | null }>(
        '/mirror', { method: 'POST', body: JSON.stringify({ entryId }) }
      ),
    usage: () => request<{ usedThisWeek: number; limit: number }>('/mirror/usage'),
    feedback: (aiResponseId: string, helpful: boolean) =>
      request<any>('/mirror/feedback', { method: 'POST', body: JSON.stringify({ aiResponseId, helpful }) }),
  },
  growth: {
    getExperiment: () => request<any>('/growth/experiment'),
    completeExperiment: (status: 'completed' | 'skipped') =>
      request<any>('/growth/experiment', { method: 'POST', body: JSON.stringify({ status }) }),
    getReflection: (month?: string) => {
      const q = month ? `?month=${encodeURIComponent(month)}` : '';
      return request<any>(`/growth/reflection${q}`);
    },
    saveReflection: (content: string) =>
      request<any>('/growth/reflection', { method: 'POST', body: JSON.stringify({ content }) }),
  },
  insights: {
    weekly: async () => {
      const raw = await request<any>('/insights/weekly');
      return transformWeekly(raw);
    },
    patterns: async () => {
      const raw = await request<any[]>('/insights/patterns');
      return transformPatterns(raw);
    },
  },
  users: {
    me: () => request<any>('/users/me'),
    update: (body: { display_name?: string; persona?: string; timezone?: string }) =>
      request<any>('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
    delete: () => request<any>('/users/me', { method: 'DELETE' }),
  },
};
