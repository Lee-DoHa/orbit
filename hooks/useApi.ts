import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useEntries(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['entries', params],
    queryFn: () => api.entries.list(params),
  });
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: ['entries', id],
    queryFn: () => api.entries.get(id),
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.entries.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
}

export function useMirrorAnalysis() {
  return useMutation({
    mutationFn: api.mirror.analyze,
  });
}

export function useWeeklyInsights() {
  return useQuery({
    queryKey: ['insights', 'weekly'],
    queryFn: api.insights.weekly,
  });
}

export function usePatterns() {
  return useQuery({
    queryKey: ['insights', 'patterns'],
    queryFn: api.insights.patterns,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: api.users.me,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.users.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'me'] }),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.entries.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.entries.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}

export function useMirrorUsage() {
  return useQuery({
    queryKey: ['mirror', 'usage'],
    queryFn: api.mirror.usage,
  });
}

export function useMirrorFeedback() {
  return useMutation({
    mutationFn: ({ aiResponseId, helpful }: { aiResponseId: string; helpful: boolean }) =>
      api.mirror.feedback(aiResponseId, helpful),
  });
}

export function useExperiment() {
  return useQuery({
    queryKey: ['growth', 'experiment'],
    queryFn: api.growth.getExperiment,
  });
}

export function useCompleteExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: 'completed' | 'skipped') => api.growth.completeExperiment(status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['growth', 'experiment'] }),
  });
}

export function useReflection(month?: string) {
  return useQuery({
    queryKey: ['growth', 'reflection', month],
    queryFn: () => api.growth.getReflection(month),
  });
}

export function useSaveReflection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => api.growth.saveReflection(content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['growth', 'reflection'] }),
  });
}

// --- AI Insights (Pro only) ---

export function useWeeklyAISummary(isPro: boolean) {
  return useQuery({
    queryKey: ['ai-insights', 'weekly-summary'],
    queryFn: api.aiInsights.weeklySummary,
    enabled: isPro,
  });
}

export function usePatternExplanations(isPro: boolean) {
  return useQuery({
    queryKey: ['ai-insights', 'pattern-explanations'],
    queryFn: api.aiInsights.patternExplanations,
    enabled: isPro,
  });
}

export function useMonthlyNarrative(isPro: boolean, month?: string) {
  return useQuery({
    queryKey: ['ai-insights', 'monthly-narrative', month],
    queryFn: () => api.aiInsights.monthlyNarrative(month),
    enabled: isPro,
  });
}

export function useSmartExperiment(isPro: boolean) {
  return useQuery({
    queryKey: ['growth', 'smart-experiment'],
    queryFn: api.growth.getSmartExperiment,
    enabled: isPro,
  });
}
