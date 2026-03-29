import { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, ActivityIndicator, Pressable, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { MirrorCard } from '@/components/mirror/MirrorCard';
import { EmotionChipGroup } from '@/components/emotion/EmotionChipGroup';
import { IntensitySlider } from '@/components/emotion/IntensitySlider';
import { ContextTagSelector } from '@/components/emotion/ContextTagSelector';
import { useEntry, useDeleteEntry, useUpdateEntry } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { EMOTIONS, CONTEXTS, type EmotionId, type ContextId } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeContext';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { data: entry, isLoading, isError, refetch } = useEntry(id!);
  const deleteEntry = useDeleteEntry();
  const updateEntry = useUpdateEntry();
  const isSaving = updateEntry.isPending;
  const isDeleting = deleteEntry.isPending;

  const [isEditing, setIsEditing] = useState(false);
  const [editEmotions, setEditEmotions] = useState<EmotionId[]>([]);
  const [editIntensity, setEditIntensity] = useState(3);
  const [editContext, setEditContext] = useState<ContextId | null>(null);
  const [editNote, setEditNote] = useState('');

  function startEdit() {
    if (!entry) return;
    // Map emotion names back to IDs
    const emotionIds = (entry.emotions || []).map((name: string) => {
      const found = EMOTIONS.find(e => e.name === name);
      return found?.id;
    }).filter((id): id is EmotionId => id !== undefined);
    // Map context name back to ID
    const contextId = CONTEXTS.find(c => c.name === entry.context)?.id ?? null;
    setEditEmotions(emotionIds);
    setEditIntensity(entry.intensity);
    setEditContext(contextId);
    setEditNote(entry.note || '');
    setIsEditing(true);
  }

  async function handleSave() {
    if (editEmotions.length === 0) {
      Alert.alert('알림', '감정을 최소 1개 이상 선택해주세요.');
      return;
    }
    try {
      await updateEntry.mutateAsync({ id: id!, body: {
        emotionIds: editEmotions,
        intensity: editIntensity,
        contextTag: editContext || undefined,
        note: editNote || undefined,
      }});
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['entries', id] });
      Alert.alert('수정 완료', '기록이 수정되었습니다.');
    } catch {
      Alert.alert('오류', '수정에 실패했습니다. 네트워크 연결을 확인해주세요.');
    }
  }

  function handleDelete() {
    Alert.alert('기록 삭제', '이 기록을 삭제하시겠어요?\n삭제 후 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEntry.mutateAsync(id!);
            router.back();
          } catch {
            Alert.alert('오류', '삭제에 실패했습니다. 네트워크 연결을 확인해주세요.');
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
        </View>
      </GradientBackground>
    );
  }

  if (!entry || isError) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>기록을 찾을 수 없습니다.</Text>
          <Pressable style={[styles.retryButton, { backgroundColor: colors.accent.blueSubtle, borderColor: `${colors.accent.blue}4D` }]} onPress={() => refetch()}>
            <Ionicons name="refresh-outline" size={18} color={colors.accent.blue} />
            <Text style={[styles.retryButtonText, { color: colors.accent.blue }]}>다시 시도</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: colors.text.secondary }]}>돌아가기</Text>
          </Pressable>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.date, { color: colors.text.primary }]}>{entry.date} ({entry.dayOfWeek})</Text>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.surface.card }, (isSaving || isDeleting) && styles.actionBtnDisabled]}
            onPress={isEditing ? handleSave : startEdit}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.accent.blue} />
            ) : (
              <Ionicons name={isEditing ? "checkmark-outline" : "create-outline"} size={20} color={colors.accent.blue} />
            )}
            <Text style={[styles.actionText, { color: colors.accent.blue }]}>{isEditing ? (isSaving ? '저장 중...' : '저장') : '수정'}</Text>
          </Pressable>
          {isEditing && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.surface.card }, isSaving && styles.actionBtnDisabled]}
              onPress={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <Ionicons name="close-outline" size={20} color={colors.text.secondary} />
              <Text style={[styles.actionText, { color: colors.text.secondary }]}>취소</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.surface.card }, (isSaving || isDeleting) && styles.actionBtnDisabled]}
            onPress={handleDelete}
            disabled={isSaving || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.status.error} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            )}
            <Text style={[styles.actionText, { color: colors.status.error }]}>{isDeleting ? '삭제 중...' : '삭제'}</Text>
          </Pressable>
        </View>

        {isEditing ? (
          <GlassCard style={styles.card}>
            <Text style={[styles.label, { color: colors.text.secondary }]}>감정 수정</Text>
            <EmotionChipGroup selected={editEmotions} onToggle={(id) => {
              setEditEmotions(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
            }} />
            <Text style={[styles.label, { marginTop: 16, color: colors.text.secondary }]}>강도</Text>
            <IntensitySlider value={editIntensity} onChange={setEditIntensity} />
            <Text style={[styles.label, { marginTop: 16, color: colors.text.secondary }]}>상황</Text>
            <ContextTagSelector selected={editContext} onSelect={setEditContext} />
            <Text style={[styles.label, { marginTop: 16, color: colors.text.secondary }]}>메모</Text>
            <TextInput
              style={[styles.editInput, { backgroundColor: colors.surface.card, borderColor: colors.surface.cardBorder, color: colors.text.primary }]}
              value={editNote}
              onChangeText={setEditNote}
              placeholder="한 줄 기록"
              placeholderTextColor={colors.text.tertiary}
              multiline
              maxLength={200}
            />
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.card}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>감정</Text>
              <View style={styles.emotionRow}>
                {(entry.emotions || []).map((e: string) => {
                  const emotionColor = colors.emotion[e as keyof typeof colors.emotion] || colors.text.secondary;
                  return (
                    <View
                      key={e}
                      style={[
                        styles.emotionBadge,
                        { backgroundColor: emotionColor + '20' },
                      ]}
                    >
                      <View
                        style={[styles.emotionDot, { backgroundColor: emotionColor }]}
                      />
                      <Text style={[styles.emotionText, { color: emotionColor }]}>
                        {e}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.metaRow}>
                <View style={[styles.metaItem, { backgroundColor: colors.surface.card }]}>
                  <Text style={[styles.metaLabel, { color: colors.text.secondary }]}>강도</Text>
                  <Text style={[styles.metaValue, { color: colors.text.primary }]}>{entry.intensity}/5</Text>
                </View>
                <View style={[styles.metaItem, { backgroundColor: colors.surface.card }]}>
                  <Text style={[styles.metaLabel, { color: colors.text.secondary }]}>상황</Text>
                  <Text style={[styles.metaValue, { color: colors.text.primary }]}>{entry.context}</Text>
                </View>
              </View>
            </GlassCard>

            {entry.note && (
              <GlassCard style={styles.card}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>기록</Text>
                <Text style={[styles.noteText, { color: colors.text.primary }]}>{entry.note}</Text>
              </GlassCard>
            )}
          </>
        )}

        {entry.mirror && <MirrorCard data={entry.mirror} />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  date: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  card: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  emotionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  emotionBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  emotionDot: { width: 8, height: 8, borderRadius: 4 },
  emotionText: { fontSize: 14, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  metaLabel: { fontSize: 11, marginBottom: 4 },
  metaValue: { fontSize: 17, fontWeight: '700' },
  noteText: { fontSize: 15, lineHeight: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15 },
  actionRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  actionBtnDisabled: { opacity: 0.5 },
  actionText: { fontSize: 13, fontWeight: '600' },
  editInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 15, minHeight: 60, textAlignVertical: 'top' },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  retryButtonText: { fontSize: 14, fontWeight: '600' },
  backButton: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10 },
  backButtonText: { fontSize: 14 },
});
