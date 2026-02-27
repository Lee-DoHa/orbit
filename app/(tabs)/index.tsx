import { useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const MOCK_MIRROR = {
  understanding: '업무 상황에서 긴장과 피로를 동시에 느끼고 계시는군요.',
  structure: '최근 7일 중 4일, 업무 관련 긴장이 반복적으로 나타났습니다.',
  suggestion: '오늘 퇴근 후 좋아하는 음료를 마시며 5분간 아무것도 하지 않는 시간을 가져보세요.',
  question: '성과는 당신에게 어떤 의미인가요?',
};

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionId[]>([]);
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY);
  const [context, setContext] = useState<ContextId | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mirrorResult, setMirrorResult] = useState<typeof MOCK_MIRROR | null>(null);

  const canSubmit = selectedEmotions.length > 0;

  const handleToggleEmotion = useCallback((id: EmotionId) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    setIsLoading(true);
    setMirrorResult(null);
    // Simulate AI call
    setTimeout(() => {
      setIsLoading(false);
      setMirrorResult(MOCK_MIRROR);
    }, 2000);
  }, [canSubmit]);

  const handleReset = useCallback(() => {
    setSelectedEmotions([]);
    setIntensity(DEFAULT_INTENSITY);
    setContext(null);
    setNote('');
    setMirrorResult(null);
  }, []);

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
              <MirrorCard data={mirrorResult} />
              <View style={styles.resultActions}>
                <CosmicButton
                  title="새로운 기록"
                  onPress={handleReset}
                  variant="secondary"
                />
                <CosmicButton
                  title="인사이트 보기"
                  onPress={() => {}}
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
  content: { padding: 24, paddingBottom: 100 },
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
