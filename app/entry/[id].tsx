import { ScrollView, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { MirrorCard } from '@/components/mirror/MirrorCard';
import { useEntry } from '@/hooks/useApi';

const EMOTION_COLORS: Record<string, string> = {
  긴장: '#FFB84D', 불안: '#FF6B6B', 피로: '#7B8794', 안정: '#5CE0D8',
  설렘: '#FF8FAB', 무기력: '#6B7280', 집중: '#4A9EFF', 만족: '#7FE5A0',
  외로움: '#A78BFA', 혼란: '#F59E0B',
};

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading } = useEntry(id!);

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A9EFF" />
        </View>
      </GradientBackground>
    );
  }

  if (!entry) {
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
        <Text style={styles.date}>{entry.date}</Text>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>감정</Text>
          <View style={styles.emotionRow}>
            {entry.emotions.map((e: string) => (
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
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>안정도</Text>
              <Text style={styles.metaValue}>{entry.stability}</Text>
            </View>
          </View>
        </GlassCard>

        {entry.note && (
          <GlassCard style={styles.card}>
            <Text style={styles.label}>기록</Text>
            <Text style={styles.noteText}>{entry.note}</Text>
          </GlassCard>
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
});
