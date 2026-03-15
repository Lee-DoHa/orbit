import { ScrollView, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProFeatureCard } from '@/components/ui/ProFeatureCard';
import { useWeeklyInsights, usePatterns, useUserProfile, useWeeklyAISummary, usePatternExplanations } from '@/hooks/useApi';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function MiniChart({ data }: { data: { day: string; value: number }[] }) {
  const maxVal = 5;
  const chartHeight = 120;
  return (
    <View style={chartStyles.container}>
      {data.map((d) => (
        <View key={d.day} style={chartStyles.barGroup}>
          <View style={chartStyles.barTrack}>
            <View
              style={[
                chartStyles.barFill,
                {
                  height: (d.value / maxVal) * chartHeight,
                  backgroundColor: d.value >= 3.5 ? '#FF9F43' : '#4A9EFF',
                },
              ]}
            />
          </View>
          <Text style={chartStyles.label}>{d.day}</Text>
        </View>
      ))}
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { data: weekly, isLoading: weeklyLoading, isError: weeklyError } = useWeeklyInsights();
  const { data: patterns, isLoading: patternsLoading, isError: patternsError } = usePatterns();
  const { data: user } = useUserProfile();

  const isPro = user?.subscription_tier === 'pro';
  const { data: aiSummary } = useWeeklyAISummary(isPro);
  const { data: aiPatterns } = usePatternExplanations(isPro);

  const isLoading = weeklyLoading || patternsLoading;
  const isError = weeklyError || patternsError;

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 16 }]}>
          <ActivityIndicator size="large" color="#4A9EFF" />
        </View>
      </GradientBackground>
    );
  }

  if (isError) {
    return (
      <GradientBackground>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>인사이트를 불러올 수 없어요</Text>
          <Text style={styles.emptySubtitle}>네트워크 연결을 확인해주세요</Text>
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

  const firstPattern = patterns?.[0];

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="감정 인사이트" subtitle="최근 7일간의 감정 흐름이에요" />

        <GlassCard style={styles.stabilityCard}>
          <Text style={styles.stabilityLabel}>안정도 지수</Text>
          <View style={styles.stabilityRow}>
            <Text style={styles.stabilityNumber}>{stabilityIndex}</Text>
            <View style={[styles.stabilityBadge, stabilityChange < 0 && styles.stabilityBadgeNeg]}>
              <Text style={[styles.stabilityChange, stabilityChange < 0 && styles.stabilityChangeNeg]}>
                {stabilityChange >= 0 ? `+${stabilityChange}` : String(stabilityChange)}
              </Text>
            </View>
          </View>
          <Text style={styles.stabilityDesc}>
            {stabilityChange >= 0
              ? '지난주 대비 안정도가 높아졌어요'
              : '지난주 대비 안정도가 낮아졌어요'}
          </Text>
        </GlassCard>

        <GlassCard style={styles.chartCard}>
          <Text style={styles.cardTitle}>주간 감정 강도</Text>
          <MiniChart data={chartData} />
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <Text style={styles.cardTitle}>최근 7일 요약</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{topEmotion}</Text>
              <Text style={styles.statLabel}>가장 잦은 감정</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgIntensity}</Text>
              <Text style={styles.statLabel}>평균 강도</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{topContext}</Text>
              <Text style={styles.statLabel}>주요 상황</Text>
            </View>
          </View>
        </GlassCard>

        {firstPattern && (
          <GlassCard variant="highlight" style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <Text style={styles.patternIcon}>🔍</Text>
              <Text style={styles.patternTitle}>패턴 발견</Text>
            </View>
            <Text style={styles.patternText}>{firstPattern.description}</Text>
            {firstPattern.suggestion && (
              <Text style={styles.patternHint}>{firstPattern.suggestion}</Text>
            )}
          </GlassCard>
        )}

        {/* AI Weekly Summary */}
        {isPro ? (
          aiSummary ? (
            <GlassCard style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={18} color="#A78BFA" />
                <Text style={styles.aiTitle}>AI 주간 요약</Text>
              </View>
              <Text style={styles.aiNarrative}>{aiSummary.narrative}</Text>
              {aiSummary.highlights?.length > 0 && (
                <View style={styles.aiHighlights}>
                  {aiSummary.highlights.map((h: string, i: number) => (
                    <View key={i} style={styles.aiHighlightItem}>
                      <Ionicons name="checkmark-circle" size={14} color="#7FE5A0" />
                      <Text style={styles.aiHighlightText}>{h}</Text>
                    </View>
                  ))}
                </View>
              )}
              {aiSummary.suggestion && (
                <View style={styles.aiSuggestionBox}>
                  <Text style={styles.aiSuggestionLabel}>이번 주 제안</Text>
                  <Text style={styles.aiSuggestionText}>{aiSummary.suggestion}</Text>
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
        {isPro && aiPatterns && aiPatterns.length > 0 && (
          <GlassCard style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="analytics" size={18} color="#A78BFA" />
              <Text style={styles.aiTitle}>AI 패턴 분석</Text>
            </View>
            {aiPatterns.map((p: any, i: number) => (
              <View key={i} style={[styles.aiPatternItem, i > 0 && styles.aiPatternDivider]}>
                <Text style={styles.aiPatternExplanation}>{p.explanation}</Text>
                {p.suggestion && (
                  <Text style={styles.aiPatternSuggestion}>{p.suggestion}</Text>
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  label: {
    color: '#8E8EA0',
    fontSize: 11,
    marginTop: 8,
  },
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#F0F0F5', fontSize: 17, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { color: '#8E8EA0', fontSize: 14, textAlign: 'center' },
  stabilityCard: { marginBottom: 16 },
  stabilityLabel: { color: '#8E8EA0', fontSize: 13, marginBottom: 8 },
  stabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stabilityNumber: { color: '#F0F0F5', fontSize: 48, fontWeight: '700' },
  stabilityBadge: {
    backgroundColor: 'rgba(127, 229, 160, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stabilityChange: { color: '#7FE5A0', fontSize: 15, fontWeight: '600' },
  stabilityBadgeNeg: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  stabilityChangeNeg: { color: '#FF6B6B' },
  stabilityDesc: { color: '#8E8EA0', fontSize: 13, marginTop: 8 },
  chartCard: { marginBottom: 16 },
  cardTitle: { color: '#F0F0F5', fontSize: 15, fontWeight: '600' },
  statCard: { marginBottom: 16 },
  statRow: { flexDirection: 'row', marginTop: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#F0F0F5', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  statLabel: { color: '#8E8EA0', fontSize: 11 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 8 },
  patternCard: { marginBottom: 16 },
  patternHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  patternIcon: { fontSize: 18 },
  patternTitle: { color: '#4A9EFF', fontSize: 15, fontWeight: '600' },
  patternText: { color: '#F0F0F5', fontSize: 14, lineHeight: 22 },
  patternHint: { color: '#8E8EA0', fontSize: 13, marginTop: 12, fontStyle: 'italic' },
  // AI card styles
  aiCard: { marginBottom: 16 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiTitle: { color: '#A78BFA', fontSize: 15, fontWeight: '600' },
  aiNarrative: { color: '#F0F0F5', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  aiHighlights: { gap: 8, marginBottom: 12 },
  aiHighlightItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiHighlightText: { color: '#C0C0CC', fontSize: 13 },
  aiSuggestionBox: {
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#A78BFA',
  },
  aiSuggestionLabel: { color: '#A78BFA', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  aiSuggestionText: { color: '#C0C0CC', fontSize: 13, lineHeight: 20 },
  proCard: { marginBottom: 16 },
  // AI pattern styles
  aiPatternItem: { paddingVertical: 8 },
  aiPatternDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  aiPatternExplanation: { color: '#F0F0F5', fontSize: 14, lineHeight: 22 },
  aiPatternSuggestion: { color: '#8E8EA0', fontSize: 13, marginTop: 6, fontStyle: 'italic' },
});
