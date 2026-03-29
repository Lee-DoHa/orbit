import { ScrollView, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProFeatureCard } from '@/components/ui/ProFeatureCard';
import { useWeeklyInsights, usePatterns, useUserProfile, useWeeklyAISummary, usePatternExplanations } from '@/hooks/useApi';
import { useTheme } from '@/theme/ThemeContext';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function MiniChart({ data }: { data: { day: string; value: number }[] }) {
  const { colors } = useTheme();
  const maxVal = 5;
  const chartHeight = 120;
  return (
    <View style={chartStyles.container}>
      {data.map((d) => (
        <View key={d.day} style={chartStyles.barGroup}>
          <View style={[chartStyles.barTrack, { backgroundColor: colors.surface.card }]}>
            <View
              style={[
                chartStyles.barFill,
                {
                  height: (d.value / maxVal) * chartHeight,
                  backgroundColor: d.value >= 3.5 ? colors.status.warning : colors.accent.blue,
                },
              ]}
            />
          </View>
          <Text style={[chartStyles.label, { color: colors.text.secondary }]}>{d.day}</Text>
        </View>
      ))}
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: weekly, isLoading: weeklyLoading, isError: weeklyError } = useWeeklyInsights();
  const { data: patterns, isLoading: patternsLoading, isError: patternsError } = usePatterns();
  const { data: user } = useUserProfile();

  const isPro = user?.subscription_tier === 'pro';
  const { data: aiSummary, isLoading: aiSummaryLoading, isError: aiSummaryError } = useWeeklyAISummary(isPro);
  const { data: aiPatterns, isLoading: aiPatternsLoading, isError: aiPatternsError } = usePatternExplanations(isPro);

  const isLoading = weeklyLoading || patternsLoading || (isPro && aiSummaryLoading) || (isPro && aiPatternsLoading);
  const isError = weeklyError || patternsError || (isPro && aiSummaryError) || (isPro && aiPatternsError);

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 16 }]}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
        </View>
      </GradientBackground>
    );
  }

  if (isError) {
    return (
      <GradientBackground>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>인사이트를 불러올 수 없어요</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>네트워크 연결을 확인해주세요</Text>
        </View>
      </GradientBackground>
    );
  }

  const stabilityIndex = weekly?.stabilityIndex ?? 0;
  const stabilityChange = weekly?.stabilityChange ?? 0;
  const chartData: { day: string; value: number }[] = weekly?.weeklyChart ?? DAY_LABELS.map((d) => ({ day: d, value: 0 }));
  const topEmotion = weekly?.topEmotion ?? '-';
  const avgIntensity = weekly?.avgIntensity ?? 0;
  const topContext = weekly?.topContext ?? '-';

  const hasWeeklyData = chartData.some((d) => d.value > 0);
  const hasPatterns = patterns && patterns.length > 0;

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="감정 인사이트" subtitle="최근 7일간의 감정 흐름이에요" />

        {hasWeeklyData ? (
          <>
            <GlassCard style={styles.stabilityCard}>
              <Text style={[styles.stabilityLabel, { color: colors.text.secondary }]}>안정도 지수</Text>
              <View style={styles.stabilityRow}>
                <Text style={[styles.stabilityNumber, { color: colors.text.primary }]}>{stabilityIndex}</Text>
                <View style={[styles.stabilityBadge, { backgroundColor: `${colors.status.success}26` }, stabilityChange < 0 && { backgroundColor: `${colors.status.error}26` }]}>
                  <Text style={[styles.stabilityChange, { color: colors.status.success }, stabilityChange < 0 && { color: colors.status.error }]}>
                    {stabilityChange >= 0 ? `+${Number(stabilityChange).toFixed(1)}` : Number(stabilityChange).toFixed(1)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.stabilityDesc, { color: colors.text.secondary }]}>
                {stabilityChange >= 0
                  ? '지난주 대비 안정도가 높아졌어요'
                  : '지난주 대비 안정도가 낮아졌어요'}
              </Text>
            </GlassCard>

            <GlassCard style={styles.chartCard}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>주간 감정 강도</Text>
              <MiniChart data={chartData} />
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>최근 7일 요약</Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>{topEmotion}</Text>
                  <Text style={[styles.statLabel, { color: colors.text.secondary }]}>가장 잦은 감정</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>{Number(avgIntensity).toFixed(1)}</Text>
                  <Text style={[styles.statLabel, { color: colors.text.secondary }]}>평균 강도</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>{topContext}</Text>
                  <Text style={[styles.statLabel, { color: colors.text.secondary }]}>주요 상황</Text>
                </View>
              </View>
            </GlassCard>
          </>
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>이번 주는 아직 기록이 없어요</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>감정을 기록하면 인사이트를 확인할 수 있어요</Text>
          </GlassCard>
        )}

        {hasPatterns ? (
          patterns.map((pattern: any, index: number) => (
            <GlassCard variant="highlight" style={styles.patternCard} key={index}>
              <View style={styles.patternHeader}>
                <Text style={styles.patternIcon}>🔍</Text>
                <Text style={[styles.patternTitle, { color: colors.accent.blue }]}>패턴 발견</Text>
              </View>
              <Text style={[styles.patternText, { color: colors.text.primary }]}>{pattern.description}</Text>
              {pattern.suggestion && (
                <Text style={[styles.patternHint, { color: colors.text.secondary }]}>{pattern.suggestion}</Text>
              )}
            </GlassCard>
          ))
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>패턴이 아직 발견되지 않았어요</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>기록이 쌓이면 패턴을 분석해드릴게요</Text>
          </GlassCard>
        )}

        {/* AI Weekly Summary */}
        {isPro ? (
          aiSummaryLoading ? (
            <GlassCard style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={18} color={colors.accent.violet} />
                <Text style={[styles.aiTitle, { color: colors.accent.violet }]}>AI 주간 요약</Text>
              </View>
              <View style={styles.aiLoadingRow}>
                <ActivityIndicator size="small" color={colors.accent.violet} />
                <Text style={[styles.aiLoadingText, { color: colors.text.secondary }]}>AI가 분석 중이에요...</Text>
              </View>
            </GlassCard>
          ) : aiSummary ? (
            <GlassCard style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={18} color={colors.accent.violet} />
                <Text style={[styles.aiTitle, { color: colors.accent.violet }]}>AI 주간 요약</Text>
              </View>
              <Text style={[styles.aiNarrative, { color: colors.text.primary }]}>{aiSummary.narrative}</Text>
              {aiSummary.highlights?.length > 0 && (
                <View style={styles.aiHighlights}>
                  {aiSummary.highlights.map((h: string, i: number) => (
                    <View key={i} style={styles.aiHighlightItem}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.status.success} />
                      <Text style={[styles.aiHighlightText, { color: colors.text.secondary }]}>{h}</Text>
                    </View>
                  ))}
                </View>
              )}
              {aiSummary.suggestion && (
                <View style={[styles.aiSuggestionBox, { backgroundColor: `${colors.accent.violet}14`, borderLeftColor: colors.accent.violet }]}>
                  <Text style={[styles.aiSuggestionLabel, { color: colors.accent.violet }]}>이번 주 제안</Text>
                  <Text style={[styles.aiSuggestionText, { color: colors.text.secondary }]}>{aiSummary.suggestion}</Text>
                </View>
              )}
            </GlassCard>
          ) : null
        ) : (
          <ProFeatureCard
            icon="sparkles"
            title="AI 주간 요약"
            description="AI가 감정 흐름을 분석하여 맞춤형 주간 요약을 제공해요"
            style={styles.proCard}
          />
        )}

        {/* AI Pattern Explanations */}
        {isPro && aiPatternsLoading && (
          <GlassCard style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="analytics" size={18} color={colors.accent.violet} />
              <Text style={[styles.aiTitle, { color: colors.accent.violet }]}>AI 패턴 분석</Text>
            </View>
            <View style={styles.aiLoadingRow}>
              <ActivityIndicator size="small" color={colors.accent.violet} />
              <Text style={[styles.aiLoadingText, { color: colors.text.secondary }]}>AI가 분석 중이에요...</Text>
            </View>
          </GlassCard>
        )}
        {isPro && !aiPatternsLoading && aiPatterns && aiPatterns.length > 0 && (
          <GlassCard style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="analytics" size={18} color={colors.accent.violet} />
              <Text style={[styles.aiTitle, { color: colors.accent.violet }]}>AI 패턴 분석</Text>
            </View>
            {aiPatterns.map((p: any, i: number) => (
              <View key={i} style={[styles.aiPatternItem, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <Text style={[styles.aiPatternExplanation, { color: colors.text.primary }]}>{p.explanation}</Text>
                {p.suggestion && (
                  <Text style={[styles.aiPatternSuggestion, { color: colors.text.secondary }]}>{p.suggestion}</Text>
                )}
              </View>
            ))}
          </GlassCard>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginTop: 16,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 24,
    height: 120,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  label: {
    fontSize: 11,
    marginTop: 8,
  },
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  stabilityCard: { marginBottom: 16 },
  stabilityLabel: { fontSize: 13, marginBottom: 8 },
  stabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stabilityNumber: { fontSize: 48, fontWeight: '700' },
  stabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stabilityChange: { fontSize: 15, fontWeight: '600' },
  stabilityDesc: { fontSize: 13, marginTop: 8 },
  chartCard: { marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  statCard: { marginBottom: 16 },
  statRow: { flexDirection: 'row', marginTop: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, marginHorizontal: 8 },
  patternCard: { marginBottom: 16 },
  patternHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  patternIcon: { fontSize: 18 },
  patternTitle: { fontSize: 15, fontWeight: '600' },
  patternText: { fontSize: 14, lineHeight: 22 },
  patternHint: { fontSize: 13, marginTop: 12, fontStyle: 'italic' },
  // AI card styles
  aiCard: { marginBottom: 16 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiTitle: { fontSize: 15, fontWeight: '600' },
  aiNarrative: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  aiHighlights: { gap: 8, marginBottom: 12 },
  aiHighlightItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiHighlightText: { fontSize: 13 },
  aiSuggestionBox: {
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
  },
  aiSuggestionLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  aiSuggestionText: { fontSize: 13, lineHeight: 20 },
  proCard: { marginBottom: 16 },
  emptyCard: { marginBottom: 16, alignItems: 'center', paddingVertical: 32 },
  aiLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  aiLoadingText: { fontSize: 14 },
  // AI pattern styles
  aiPatternItem: { paddingVertical: 8 },
  aiPatternExplanation: { fontSize: 14, lineHeight: 22 },
  aiPatternSuggestion: { fontSize: 13, marginTop: 6, fontStyle: 'italic' },
});
