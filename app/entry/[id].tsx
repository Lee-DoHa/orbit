import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { MirrorCard } from '@/components/mirror/MirrorCard';

const MOCK_DETAIL = {
  date: '2025년 2월 27일 목요일',
  emotions: ['긴장', '피로'],
  intensity: 4,
  context: '업무',
  note: '프로젝트 마감이 다가와서 계속 긴장 상태. 회의도 많았고 집중이 어려웠다.',
  mirror: {
    understanding: '업무 상황에서 긴장과 피로를 동시에 느끼고 계시는군요.',
    structure: '최근 7일 중 4일, 업무 관련 긴장이 반복적으로 나타났습니다.',
    suggestion: '오늘 퇴근 후 좋아하는 음료를 마시며 5분간 아무것도 하지 않는 시간을 가져보세요.',
    question: '성과는 당신에게 어떤 의미인가요?',
  },
  stability: 68,
};

const EMOTION_COLORS: Record<string, string> = {
  긴장: '#FFB84D', 불안: '#FF6B6B', 피로: '#7B8794', 안정: '#5CE0D8',
  설렘: '#FF8FAB', 무기력: '#6B7280', 집중: '#4A9EFF', 만족: '#7FE5A0',
  외로움: '#A78BFA', 혼란: '#F59E0B',
};

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.date}>{MOCK_DETAIL.date}</Text>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>감정</Text>
          <View style={styles.emotionRow}>
            {MOCK_DETAIL.emotions.map((e) => (
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
              <Text style={styles.metaValue}>{MOCK_DETAIL.intensity}/5</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>상황</Text>
              <Text style={styles.metaValue}>{MOCK_DETAIL.context}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>안정도</Text>
              <Text style={styles.metaValue}>{MOCK_DETAIL.stability}</Text>
            </View>
          </View>
        </GlassCard>

        {MOCK_DETAIL.note && (
          <GlassCard style={styles.card}>
            <Text style={styles.label}>기록</Text>
            <Text style={styles.noteText}>{MOCK_DETAIL.note}</Text>
          </GlassCard>
        )}

        <MirrorCard data={MOCK_DETAIL.mirror} />

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
});
