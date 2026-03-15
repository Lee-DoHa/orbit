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
import { EMOTIONS, CONTEXTS } from '@/lib/constants';

const EMOTION_COLORS: Record<string, string> = {
  긴장: '#FFB84D', 불안: '#FF6B6B', 피로: '#7B8794', 안정: '#5CE0D8',
  설렘: '#FF8FAB', 무기력: '#6B7280', 집중: '#4A9EFF', 만족: '#7FE5A0',
  외로움: '#A78BFA', 혼란: '#F59E0B',
};

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: entry, isLoading, isError } = useEntry(id!);
  const deleteEntry = useDeleteEntry();
  const updateEntry = useUpdateEntry();

  const [isEditing, setIsEditing] = useState(false);
  const [editEmotions, setEditEmotions] = useState<number[]>([]);
  const [editIntensity, setEditIntensity] = useState(3);
  const [editContext, setEditContext] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  function startEdit() {
    if (!entry) return;
    // Map emotion names back to IDs
    const emotionIds = (entry.emotions || []).map((name: string) => {
      const found = EMOTIONS.find(e => e.name === name);
      return found?.id;
    }).filter(Boolean) as number[];
    // Map context name back to ID
    const contextId = CONTEXTS.find(c => c.name === entry.context)?.id || null;
    setEditEmotions(emotionIds);
    setEditIntensity(entry.intensity);
    setEditContext(contextId);
    setEditNote(entry.note || '');
    setIsEditing(true);
  }

  async function handleSave() {
    try {
      await updateEntry.mutateAsync({ id: id!, body: {
        emotionIds: editEmotions,
        intensity: editIntensity,
        contextTag: editContext || undefined,
        note: editNote || undefined,
      }});
      setIsEditing(false);
      Alert.alert('수정 완료', '기록이 수정되었습니다.');
    } catch {
      Alert.alert('오류', '수정에 실패했습니다.');
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
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A9EFF" />
        </View>
      </GradientBackground>
    );
  }

  if (!entry || isError) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>기록을 찾을 수 없습니다.</Text>
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
        <Text style={styles.date}>{entry.date} ({entry.dayOfWeek})</Text>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={isEditing ? handleSave : startEdit}>
            <Ionicons name={isEditing ? "checkmark-outline" : "create-outline"} size={20} color="#4A9EFF" />
            <Text style={styles.actionText}>{isEditing ? '저장' : '수정'}</Text>
          </Pressable>
          {isEditing && (
            <Pressable style={styles.actionBtn} onPress={() => setIsEditing(false)}>
              <Ionicons name="close-outline" size={20} color="#8E8EA0" />
              <Text style={[styles.actionText, { color: '#8E8EA0' }]}>취소</Text>
            </Pressable>
          )}
          <Pressable style={styles.actionBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={[styles.actionText, { color: '#FF6B6B' }]}>삭제</Text>
          </Pressable>
        </View>

        {isEditing ? (
          <GlassCard style={styles.card}>
            <Text style={styles.label}>감정 수정</Text>
            <EmotionChipGroup selected={editEmotions} onToggle={(id) => {
              setEditEmotions(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
            }} />
            <Text style={[styles.label, { marginTop: 16 }]}>강도</Text>
            <IntensitySlider value={editIntensity} onChange={setEditIntensity} />
            <Text style={[styles.label, { marginTop: 16 }]}>상황</Text>
            <ContextTagSelector selected={editContext} onSelect={setEditContext} />
            <Text style={[styles.label, { marginTop: 16 }]}>메모</Text>
            <TextInput
              style={styles.editInput}
              value={editNote}
              onChangeText={setEditNote}
              placeholder="한 줄 기록"
              placeholderTextColor="#5A5A6E"
              multiline
              maxLength={200}
            />
          </GlassCard>
        ) : (
          <>
            <GlassCard style={styles.card}>
              <Text style={styles.label}>감정</Text>
              <View style={styles.emotionRow}>
                {(entry.emotions || []).map((e: string) => (
                  <View
                    key={e}
                    style={[
                      styles.emotionBadge,
                      { backgroundColor: (EMOTION_COLORS[e] || '#8E8EA0') + '20' },
                    ]}
                  >
                    <View
                      style={[styles.emotionDot, { backgroundColor: EMOTION_COLORS[e] || '#8E8EA0' }]}
                    />
                    <Text style={[styles.emotionText, { color: EMOTION_COLORS[e] || '#8E8EA0' }]}>
                      {e}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>강도</Text>
                  <Text style={styles.metaValue}>{entry.intensity}/5</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>상황</Text>
                  <Text style={styles.metaValue}>{entry.context}</Text>
                </View>
              </View>
            </GlassCard>

            {entry.note && (
              <GlassCard style={styles.card}>
                <Text style={styles.label}>기록</Text>
                <Text style={styles.noteText}>{entry.note}</Text>
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
  date: { color: '#F0F0F5', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  card: { marginBottom: 16 },
  label: { color: '#8E8EA0', fontSize: 12, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  emotionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  emotionBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  emotionDot: { width: 8, height: 8, borderRadius: 4 },
  emotionText: { fontSize: 14, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, alignItems: 'center' },
  metaLabel: { color: '#8E8EA0', fontSize: 11, marginBottom: 4 },
  metaValue: { color: '#F0F0F5', fontSize: 17, fontWeight: '700' },
  noteText: { color: '#F0F0F5', fontSize: 15, lineHeight: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#8E8EA0', fontSize: 15 },
  actionRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
  actionText: { color: '#4A9EFF', fontSize: 13, fontWeight: '600' },
  editInput: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 12, color: '#F0F0F5', fontSize: 15, minHeight: 60, textAlignVertical: 'top' },
});
