import { useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// expo-haptics: lazy import for web safety
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try { Haptics = require('expo-haptics'); } catch {}
}
import { useCreateEntry, useMirrorAnalysis, useMirrorUsage, useMirrorFeedback, useUserProfile } from '@/hooks/useApi';
import { canUseFeature, FREE_MIRROR_LIMIT } from '@/lib/subscription';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmotionChipGroup } from '@/components/emotion/EmotionChipGroup';
import { IntensitySlider } from '@/components/emotion/IntensitySlider';
import { ContextTagSelector } from '@/components/emotion/ContextTagSelector';
import { MirrorCard } from '@/components/mirror/MirrorCard';
import { MirrorLoading } from '@/components/mirror/MirrorLoading';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/theme/tokens';
import {
  DEFAULT_INTENSITY,
  MAX_NOTE_LENGTH,
  EMOTIONS,
  type EmotionId,
  type ContextId,
} from '@/lib/constants';

type MirrorResult = {
  id: string;
  understanding: string;
  structure: string;
  suggestion: string;
  question: string | null;
};

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const createEntry = useCreateEntry();
  const mirror = useMirrorAnalysis();
  const { data: mirrorUsage } = useMirrorUsage();
  const mirrorFeedback = useMirrorFeedback();
  const { data: userProfile } = useUserProfile();
  const subscriptionTier = (userProfile?.subscription_tier || 'free') as 'free' | 'pro';

  const [selectedEmotions, setSelectedEmotions] = useState<EmotionId[]>([]);
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);
  const [context, setContext] = useState<ContextId | null>(null);
  const [note, setNote] = useState('');
  const [mirrorResult, setMirrorResult] = useState<MirrorResult | null>(null);
  const [mirrorResponseId, setMirrorResponseId] = useState<string | null>(null);

  const isLoading = createEntry.isPending || mirror.isPending;
  const canSubmit = selectedEmotions.length > 0 && !isLoading;

  const handleToggleEmotion = useCallback((id: EmotionId) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }, []);

  const handleReset = useCallback(() => {
    setSelectedEmotions([]);
    setIntensity(DEFAULT_INTENSITY);
    setContext(null);
    setNote('');
    setMirrorResult(null);
    setMirrorResponseId(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setMirrorResult(null);
    setMirrorResponseId(null);

    // Check mirror usage limit BEFORE creating entry
    if (!canUseFeature(subscriptionTier, 'mirror_unlimited')) {
      const used = mirrorUsage?.usedThisWeek ?? 0;
      if (used >= FREE_MIRROR_LIMIT) {
        Alert.alert(
          'Mirror AI 제한',
          `무료 플랜은 주 ${FREE_MIRROR_LIMIT}회까지 Mirror 분석을 이용할 수 있어요.\n기록은 저장되지만 AI 분석은 제공되지 않습니다.`,
          [
            { text: '기록만 저장', onPress: async () => {
              try {
                await createEntry.mutateAsync({
                  emotionIds: selectedEmotions, intensity,
                  contextTag: context ?? undefined, note: note || undefined,
                });
                Alert.alert('저장 완료', '감정이 기록되었습니다.');
                handleReset();
              } catch { /* ignore */ }
            }},
            { text: 'Pro 알아보기', onPress: () => router.push('/subscription' as any) },
          ]
        );
        return;
      }
    }

    try {
      const entry = await createEntry.mutateAsync({
        emotionIds: selectedEmotions,
        intensity,
        contextTag: context ?? undefined,
        note: note || undefined,
      });

      const result = await mirror.mutateAsync(entry.id);
      setMirrorResult(result);
      if (result.id) setMirrorResponseId(result.id);
      if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      if (Haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [canSubmit, selectedEmotions, intensity, context, note, createEntry, mirror, subscriptionTier, mirrorUsage, handleReset]);

  const selectedNames = selectedEmotions
    .map((id) => EMOTIONS.find((e) => e.id === id)?.name)
    .filter(Boolean)
    .join(' · ');

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SectionHeader
            title="오늘의 감정 정리"
            subtitle="당신의 우주는 어떻게 움직였나요?"
          />

          {!mirrorResult && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>오늘 느낀 감정</Text>
                <Text style={styles.sectionHint}>최대 3개까지 선택할 수 있어요</Text>
                <EmotionChipGroup
                  selected={selectedEmotions}
                  onToggle={handleToggleEmotion}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>강도</Text>
                <IntensitySlider value={intensity} onChange={setIntensity} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>상황</Text>
                <ContextTagSelector selected={context} onSelect={setContext} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>한 줄 기록</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="한 줄 또는 생각을 남겨보세요"
                  placeholderTextColor={colors.text.tertiary}
                  value={note}
                  onChangeText={setNote}
                  maxLength={MAX_NOTE_LENGTH}
                  multiline
                />
                <Text style={styles.charCount}>
                  {note.length}/{MAX_NOTE_LENGTH}
                </Text>
              </View>

              {isLoading ? (
                <MirrorLoading />
              ) : (
                <CosmicButton
                  title="감정 구조화하기"
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                />
              )}
            </>
          )}

          {mirrorResult && (
            <>
              {selectedNames ? (
                <GlassCard style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>기록된 감정</Text>
                  <Text style={styles.summaryValue}>{selectedNames}</Text>
                </GlassCard>
              ) : null}
              <MirrorCard
                data={mirrorResult}
                aiResponseId={mirrorResponseId ?? undefined}
                onFeedback={(helpful) => {
                  if (mirrorResponseId) {
                    mirrorFeedback.mutate({ aiResponseId: mirrorResponseId, helpful });
                  }
                }}
              />
              <View style={styles.resultActions}>
                <CosmicButton
                  title="새로운 기록"
                  onPress={handleReset}
                  variant="secondary"
                />
                <CosmicButton
                  title="인사이트 보기"
                  onPress={() => router.push('/(tabs)/insights')}
                  variant="ghost"
                />
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 100 },
  section: { marginBottom: 28 },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: 8,
  },
  sectionHint: {
    color: colors.text.tertiary,
    fontSize: fontSize.xs,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    color: colors.text.tertiary,
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginTop: 4,
  },
  summaryCard: { marginBottom: 16 },
  summaryLabel: { color: colors.text.secondary, fontSize: fontSize.xs, marginBottom: 4 },
  summaryValue: { color: colors.text.primary, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  resultActions: { marginTop: 20, gap: 12 },
});
