import { useState, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProFeatureCard } from '@/components/ui/ProFeatureCard';
import { useWeeklyInsights, useUserProfile, useExperiment, useCompleteExperiment, useReflection, useSaveReflection, useSmartExperiment, useMonthlyNarrative } from '@/hooks/useApi';
import { canUseFeature } from '@/lib/subscription';

const STAGES = [
  { name: 'Seed', label: '씨앗', threshold: 0 },
  { name: 'Sprout', label: '새싹', threshold: 3 },
  { name: 'Branching', label: '가지', threshold: 7 },
  { name: 'Bloom', label: '개화', threshold: 14 },
  { name: 'Stable', label: '안정', threshold: 30 },
];

function getStageIndex(entryCount: number) {
  let idx = 0;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (entryCount >= STAGES[i].threshold) {
      idx = i;
      break;
    }
  }
  return idx;
}

function getStageDescription(stageIdx: number, stabilityIndex: number) {
  if (stageIdx === 0) return '첫 감정 기록을 시작해보세요. 씨앗이 움트기 시작합니다.';
  if (stageIdx === 1) return '감정 기록이 쌓이고 있어요. 작은 새싹이 자라나고 있습니다.';
  if (stageIdx === 2) return `안정 지수 ${stabilityIndex}점! 가지가 뻗어나가고 있어요.`;
  if (stageIdx === 3) return '꾸준한 기록으로 감정 인식이 깊어지고 있어요. 곧 꽃이 필 거예요.';
  return '감정과의 안정적인 관계를 만들어가고 있습니다.';
}

export default function GrowthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: weekly, isLoading } = useWeeklyInsights();
  const { data: user } = useUserProfile();
  const tier = (user?.subscription_tier || 'free') as 'free' | 'pro';
  const isPro = tier === 'pro';
  const { data: experiment } = useExperiment();
  const completeExperiment = useCompleteExperiment();
  const { data: existingReflection } = useReflection();
  const saveReflection = useSaveReflection();
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // AI features (Pro only)
  const { data: smartExp } = useSmartExperiment(isPro);
  const { data: monthlyNarrative } = useMonthlyNarrative(isPro);

  // Experiment done = already has a response from the API
  const experimentDone = !!experiment?.status;
  const experimentStatus = experiment?.status;

  // Load existing reflection text from server
  useEffect(() => {
    if (existingReflection?.content && !reflectionText) {
      setReflectionText(existingReflection.content);
      setReflectionSaved(true);
    }
  }, [existingReflection]);

  const totalEntryCount = weekly?.totalEntryCount ?? 0;
  const stabilityIndex = weekly?.stabilityIndex ?? 0;
  const currentStage = getStageIndex(totalEntryCount);

  function handleExperimentComplete() {
    completeExperiment.mutate('completed', {
      onSuccess: () => {
        Alert.alert('완료!', '이번 주 실험을 완료했어요');
      },
      onError: () => Alert.alert('오류', '요청에 실패했습니다. 다시 시도해주세요.'),
    });
  }

  function handleExperimentSkip() {
    completeExperiment.mutate('skipped', {
      onError: () => Alert.alert('오류', '요청에 실패했습니다.'),
    });
  }

  function handleSaveReflection() {
    if (!canUseFeature(tier, 'reflection_save')) {
      Alert.alert('Pro 기능', '월간 회고 저장은 Pro에서 사용할 수 있어요.', [
        { text: '닫기' },
        { text: 'Pro 알아보기', onPress: () => router.push('/subscription' as any) },
      ]);
      return;
    }
    if (!reflectionText.trim()) return;
    saveReflection.mutate(reflectionText.trim(), {
      onSuccess: () => {
        setReflectionSaved(true);
        Alert.alert('저장 완료', '회고가 저장되었습니다.');
      },
      onError: () => Alert.alert('오류', '저장에 실패했습니다.'),
    });
  }

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
                    i < currentStage && styles.stageDotDone,
                    i === currentStage && styles.stageDotActive,
                  ]}
                />
                {i < STAGES.length - 1 && (
                  <View style={[styles.stageLine, i < currentStage && styles.stageLineDone]} />
                )}
                <Text style={[styles.stageLabel, i <= currentStage && styles.stageLabelActive]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#4A9EFF" style={{ marginTop: 16 }} />
          ) : (
            <Text style={styles.stageDesc}>
              {getStageDescription(currentStage, stabilityIndex)}
            </Text>
          )}
        </GlassCard>

        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalEntryCount}</Text>
              <Text style={styles.statLabel}>총 기록</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stabilityIndex}</Text>
              <Text style={styles.statLabel}>안정 지수</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{STAGES[currentStage].label}</Text>
              <Text style={styles.statLabel}>현재 단계</Text>
            </View>
          </View>
        </GlassCard>

        {/* Regular experiment card */}
        <GlassCard style={styles.experimentCard}>
          <Text style={styles.expTitle}>이번 주 작은 실험</Text>
          <Text style={styles.expText}>
            {experiment?.experiment_text || '이번 주 2회, 10분 산책을 시도해보세요.'}
          </Text>
          {experimentDone ? (
            <View style={styles.expDone}>
              <Ionicons name="checkmark-circle" size={24} color="#7FE5A0" />
              <Text style={styles.expDoneText}>
                이번 주 실험을 {experimentStatus === 'completed' ? '완료' : '건너뛰기'}했어요
              </Text>
            </View>
          ) : (
            <View style={styles.expButtons}>
              <Pressable style={styles.expBtn} onPress={handleExperimentComplete}>
                <Text style={styles.expBtnText}>완료</Text>
              </Pressable>
              <Pressable style={[styles.expBtn, styles.expBtnGhost]} onPress={handleExperimentSkip}>
                <Text style={[styles.expBtnText, styles.expBtnGhostText]}>건너뛰기</Text>
              </Pressable>
            </View>
          )}
        </GlassCard>

        {/* AI Smart Experiment (Pro) */}
        {isPro ? (
          smartExp ? (
            <GlassCard style={styles.aiExpCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={18} color="#A78BFA" />
                <Text style={styles.aiTitle}>AI 맞춤 실험</Text>
              </View>
              <Text style={styles.aiExpText}>{smartExp.experiment}</Text>
              {smartExp.reasoning && (
                <View style={styles.aiReasoningBox}>
                  <Text style={styles.aiReasoningText}>{smartExp.reasoning}</Text>
                </View>
              )}
            </GlassCard>
          ) : null
        ) : (
          <ProFeatureCard
            icon="sparkles"
            title="AI 맞춤 실험"
            description="감정 패턴을 분석해 나에게 딱 맞는 실험을 추천해요"
            style={styles.proCard}
          />
        )}

        {/* Monthly reflection */}
        <GlassCard>
          <Text style={styles.reflectTitle}>월간 회고</Text>
          <Text style={styles.reflectQ}>
            한 달 전과 비교했을 때, 가장 달라진 점은 무엇인가요?
          </Text>
          <TextInput
            style={styles.reflectInput}
            placeholder="회고를 작성해보세요..."
            placeholderTextColor="#5A5A6E"
            value={reflectionText}
            onChangeText={setReflectionText}
            multiline
            maxLength={500}
            editable={!reflectionSaved}
          />
          {!reflectionSaved ? (
            <Pressable
              style={[styles.reflectSaveBtn, !reflectionText.trim() && { opacity: 0.4 }]}
              onPress={handleSaveReflection}
              disabled={!reflectionText.trim()}
            >
              <Text style={styles.reflectSaveBtnText}>저장</Text>
            </Pressable>
          ) : (
            <View style={styles.reflectSaved}>
              <Ionicons name="checkmark-circle" size={16} color="#7FE5A0" />
              <Text style={styles.reflectSavedText}>저장됨</Text>
            </View>
          )}
        </GlassCard>

        {/* AI Monthly Narrative (Pro) */}
        {isPro ? (
          monthlyNarrative ? (
            <GlassCard style={styles.aiNarrativeCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="book" size={18} color="#A78BFA" />
                <Text style={styles.aiTitle}>AI 월간 내러티브</Text>
              </View>
              <Text style={styles.aiNarrativeText}>{monthlyNarrative.narrative}</Text>
              {monthlyNarrative.growthArc && (
                <View style={styles.growthArcBox}>
                  <Text style={styles.growthArcLabel}>성장 아크</Text>
                  <Text style={styles.growthArcText}>{monthlyNarrative.growthArc}</Text>
                </View>
              )}
              {monthlyNarrative.emotionalHighlights?.length > 0 && (
                <View style={styles.highlightList}>
                  {monthlyNarrative.emotionalHighlights.map((h: string, i: number) => (
                    <View key={i} style={styles.highlightItem}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>
              )}
              {monthlyNarrative.lookAhead && (
                <View style={styles.lookAheadBox}>
                  <Text style={styles.lookAheadLabel}>다음 달 전망</Text>
                  <Text style={styles.lookAheadText}>{monthlyNarrative.lookAhead}</Text>
                </View>
              )}
            </GlassCard>
          ) : null
        ) : (
          <ProFeatureCard
            icon="book"
            title="AI 월간 내러티브"
            description="AI가 한 달간의 감정 여정을 이야기로 풀어드려요"
            style={styles.proCard}
          />
        )}

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
  statsCard: { marginBottom: 16 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#F0F0F5', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statLabel: { color: '#8E8EA0', fontSize: 11 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 8 },
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
  expDone: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: 'rgba(127,229,160,0.08)', borderRadius: 12 },
  expDoneText: { color: '#7FE5A0', fontSize: 14 },
  reflectTitle: { color: '#F0F0F5', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  reflectQ: { color: '#8E8EA0', fontSize: 14, lineHeight: 22 },
  reflectInput: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 12, color: '#F0F0F5', fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginTop: 12, lineHeight: 22 },
  reflectSaveBtn: { marginTop: 12, backgroundColor: '#4A9EFF', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  reflectSaveBtnText: { color: '#F0F0F5', fontSize: 14, fontWeight: '600' },
  reflectSaved: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  reflectSavedText: { color: '#7FE5A0', fontSize: 13 },
  // AI card styles
  proCard: { marginBottom: 16, marginTop: 0 },
  aiExpCard: { marginBottom: 16 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiTitle: { color: '#A78BFA', fontSize: 15, fontWeight: '600' },
  aiExpText: { color: '#F0F0F5', fontSize: 14, lineHeight: 22, marginBottom: 8 },
  aiReasoningBox: {
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#A78BFA',
  },
  aiReasoningText: { color: '#C0C0CC', fontSize: 13, lineHeight: 20 },
  // Monthly narrative
  aiNarrativeCard: { marginTop: 16, marginBottom: 16 },
  aiNarrativeText: { color: '#F0F0F5', fontSize: 14, lineHeight: 22, marginBottom: 12 },
  growthArcBox: {
    backgroundColor: 'rgba(127, 229, 160, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  growthArcLabel: { color: '#7FE5A0', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  growthArcText: { color: '#C0C0CC', fontSize: 13 },
  highlightList: { gap: 6, marginBottom: 12 },
  highlightItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  highlightText: { color: '#C0C0CC', fontSize: 13 },
  lookAheadBox: {
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#A78BFA',
  },
  lookAheadLabel: { color: '#A78BFA', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  lookAheadText: { color: '#C0C0CC', fontSize: 13, lineHeight: 20 },
});
