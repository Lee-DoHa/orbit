import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const STAGES = [
  { name: 'Seed', label: '씨앗', active: true, done: true },
  { name: 'Sprout', label: '새싹', active: true, done: true },
  { name: 'Branching', label: '가지', active: true, done: false },
  { name: 'Bloom', label: '개화', active: false, done: false },
  { name: 'Stable', label: '안정', active: false, done: false },
];

export default function GrowthScreen() {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="감정 성장" subtitle="꾸준한 기록이 변화를 만들어요" />

        <GlassCard style={styles.stageCard}>
          <Text style={styles.stageTitle}>성장 단계</Text>
          <View style={styles.stageRow}>
            {STAGES.map((s, i) => (
              <View key={s.name} style={styles.stageItem}>
                <View
                  style={[
                    styles.stageDot,
                    s.done && styles.stageDotDone,
                    s.active && !s.done && styles.stageDotActive,
                  ]}
                />
                {i < STAGES.length - 1 && (
                  <View style={[styles.stageLine, s.done && styles.stageLineDone]} />
                )}
                <Text style={[styles.stageLabel, s.active && styles.stageLabelActive]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.stageDesc}>
            최근 14일간 안정 지수가 상승하여 새로운 가지가 자랐습니다.
          </Text>
        </GlassCard>

        <GlassCard style={styles.experimentCard}>
          <Text style={styles.expTitle}>이번 주 작은 실험</Text>
          <Text style={styles.expText}>
            이번 주 2회, 10분 산책을 시도해보세요.
          </Text>
          <View style={styles.expButtons}>
            <View style={styles.expBtn}>
              <Text style={styles.expBtnText}>완료</Text>
            </View>
            <View style={[styles.expBtn, styles.expBtnGhost]}>
              <Text style={[styles.expBtnText, styles.expBtnGhostText]}>건너뛰기</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.reflectTitle}>월간 회고</Text>
          <Text style={styles.reflectQ}>
            한 달 전과 비교했을 때, 가장 달라진 점은 무엇인가요?
          </Text>
        </GlassCard>

        <View style={{ height: 32 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  stageCard: { marginBottom: 16 },
  stageTitle: { color: '#F0F0F5', fontSize: 15, fontWeight: '600', marginBottom: 20 },
  stageRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stageItem: { alignItems: 'center', position: 'relative', flex: 1 },
  stageDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)',
  },
  stageDotDone: { backgroundColor: '#7FE5A0', borderColor: '#7FE5A0' },
  stageDotActive: { backgroundColor: '#4A9EFF', borderColor: '#4A9EFF' },
  stageLine: {
    position: 'absolute', top: 9, left: '60%',
    width: '80%', height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stageLineDone: { backgroundColor: '#7FE5A0' },
  stageLabel: { color: '#5A5A6E', fontSize: 11, marginTop: 8 },
  stageLabelActive: { color: '#F0F0F5' },
  stageDesc: { color: '#8E8EA0', fontSize: 13, marginTop: 20, lineHeight: 20 },
  experimentCard: { marginBottom: 16 },
  expTitle: { color: '#F0F0F5', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  expText: { color: '#8E8EA0', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  expButtons: { flexDirection: 'row', gap: 12 },
  expBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#4A9EFF', alignItems: 'center',
  },
  expBtnText: { color: '#F0F0F5', fontSize: 14, fontWeight: '600' },
  expBtnGhost: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  expBtnGhostText: { color: '#8E8EA0' },
  reflectTitle: { color: '#F0F0F5', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  reflectQ: { color: '#8E8EA0', fontSize: 14, lineHeight: 22 },
});
