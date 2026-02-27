import { ScrollView, Text, View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const MOCK_WEEK_DATA = [
  { day: '월', value: 3.2 },
  { day: '화', value: 2.8 },
  { day: '수', value: 4.1 },
  { day: '목', value: 3.5 },
  { day: '금', value: 2.4 },
  { day: '토', value: 1.9 },
  { day: '일', value: 2.1 },
];

function MiniChart() {
  const maxVal = 5;
  const chartHeight = 120;
  return (
    <View style={chartStyles.container}>
      {MOCK_WEEK_DATA.map((d, i) => (
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
            <Text style={styles.stabilityNumber}>72</Text>
            <View style={styles.stabilityBadge}>
              <Text style={styles.stabilityChange}>+5</Text>
            </View>
          </View>
          <Text style={styles.stabilityDesc}>지난주 대비 안정도가 높아졌어요</Text>
        </GlassCard>

        <GlassCard style={styles.chartCard}>
          <Text style={styles.cardTitle}>주간 감정 강도</Text>
          <MiniChart />
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <Text style={styles.cardTitle}>최근 7일 요약</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>긴장</Text>
              <Text style={styles.statLabel}>가장 잦은 감정</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3.2</Text>
              <Text style={styles.statLabel}>평균 강도</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>업무</Text>
              <Text style={styles.statLabel}>주요 상황</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard variant="highlight" style={styles.patternCard}>
          <View style={styles.patternHeader}>
            <Text style={styles.patternIcon}>🔍</Text>
            <Text style={styles.patternTitle}>패턴 발견</Text>
          </View>
          <Text style={styles.patternText}>
            최근 7일 중 4일, '업무' 상황에서 '긴장'이 반복되었습니다.
          </Text>
          <Text style={styles.patternHint}>
            업무와 무관한 활동을 20분 계획해보세요.
          </Text>
        </GlassCard>

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
});
