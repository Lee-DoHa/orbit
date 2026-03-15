import { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useEntries, useUserProfile } from '@/hooks/useApi';
import { canUseFeature } from '@/lib/subscription';
import { CONTEXTS } from '@/lib/constants';

const EMOTION_COLORS: Record<string, string> = {
  긴장: '#FFB84D',
  불안: '#FF6B6B',
  피로: '#7B8794',
  안정: '#5CE0D8',
  설렘: '#FF8FAB',
  무기력: '#6B7280',
  집중: '#4A9EFF',
  만족: '#7FE5A0',
  외로움: '#A78BFA',
  혼란: '#F59E0B',
};

const INTENSITY_COLORS: Record<number, string> = {
  1: '#5CE0D8',
  2: '#7FE5A0',
  3: '#FFD166',
  4: '#FF9F43',
  5: '#FF6B6B',
};

type EntryItem = {
  id: string;
  date: string;
  dayOfWeek: string;
  emotions: string[];
  intensity: number;
  context: string;
  note: string | null;
  mirrorSummary: string;
  recorded_at?: string;
};

function IntensityDots({ value }: { value: number }) {
  return (
    <View style={entryStyles.dots}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            entryStyles.dot,
            i <= value && {
              backgroundColor: INTENSITY_COLORS[value] || '#FFD166',
            },
          ]}
        />
      ))}
    </View>
  );
}

function EntryCard({ item, onPress }: { item: EntryItem; onPress: () => void }) {
  return (
    <Pressable style={entryStyles.card} onPress={onPress}>
      <View style={entryStyles.dateCol}>
        <Text style={entryStyles.dateText}>{item.date}</Text>
        <Text style={entryStyles.dayText}>{item.dayOfWeek}</Text>
      </View>
      <View style={entryStyles.contentCol}>
        <View style={entryStyles.emotionRow}>
          {item.emotions.map((e) => (
            <View
              key={e}
              style={[
                entryStyles.emotionBadge,
                { backgroundColor: (EMOTION_COLORS[e] || '#8E8EA0') + '20' },
              ]}
            >
              <View
                style={[
                  entryStyles.emotionDot,
                  { backgroundColor: EMOTION_COLORS[e] || '#8E8EA0' },
                ]}
              />
              <Text
                style={[
                  entryStyles.emotionText,
                  { color: EMOTION_COLORS[e] || '#8E8EA0' },
                ]}
              >
                {e}
              </Text>
            </View>
          ))}
          <IntensityDots value={item.intensity} />
        </View>
        <Text style={entryStyles.contextTag}>{item.context}</Text>
        {item.note && (
          <Text style={entryStyles.note} numberOfLines={1}>
            {item.note}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#5A5A6E" />
    </Pressable>
  );
}

const FILTER_OPTIONS = ['전체', '긴장', '불안', '안정', '피로', '집중', '만족', '설렘', '무기력', '외로움', '혼란'];

export default function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState('전체');
  const [searchText, setSearchText] = useState('');
  const [contextFilter, setContextFilter] = useState<string | null>(null);
  const { data: entries = [], isLoading, isError } = useEntries();
  const { data: user } = useUserProfile();
  const tier = (user?.subscription_tier || 'free') as 'free' | 'pro';
  const isPro = tier === 'pro';

  let filtered =
    filter === '전체'
      ? entries
      : entries.filter((e: EntryItem) => e.emotions.includes(filter));

  // Free tier: last 7 days only
  if (!canUseFeature(tier, 'full_archive')) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    filtered = filtered.filter((e: any) => new Date(e.recorded_at) >= sevenDaysAgo);
  }

  // Pro: search
  if (searchText && isPro) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter((e: any) =>
      e.note?.toLowerCase().includes(q) || e.emotions.some((em: string) => em.includes(q))
    );
  }

  // Pro: context filter
  if (contextFilter && isPro) {
    filtered = filtered.filter((e: any) => e.context === contextFilter);
  }

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <SectionHeader title="감정 기록" subtitle="축적된 나의 감정 여정" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_OPTIONS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isPro ? (
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#8E8EA0" />
            <TextInput
              style={styles.searchInput}
              placeholder="기록 검색..."
              placeholderTextColor="#5A5A6E"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color="#5A5A6E" />
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable style={styles.proSearchBanner} onPress={() => router.push('/subscription' as any)}>
            <Ionicons name="search-outline" size={16} color="#4A9EFF" />
            <Text style={styles.proSearchText}>검색 및 고급 필터</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </Pressable>
        )}

        {isPro && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contextFilterScroll}>
            <Pressable
              onPress={() => setContextFilter(null)}
              style={[styles.filterChip, !contextFilter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, !contextFilter && styles.filterTextActive]}>전체 상황</Text>
            </Pressable>
            {CONTEXTS.map(c => (
              <Pressable
                key={c.id}
                onPress={() => setContextFilter(c.name === contextFilter ? null : c.name)}
                style={[styles.filterChip, contextFilter === c.name && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, contextFilter === c.name && styles.filterTextActive]}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#4A9EFF" />
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>기록을 불러올 수 없어요</Text>
            <Text style={styles.emptySubtitle}>네트워크 연결을 확인해주세요</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌙</Text>
            <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
            <Text style={styles.emptySubtitle}>오늘 탭에서 첫 감정을 기록해보세요</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EntryCard
                item={item}
                onPress={() => router.push(`/entry/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={
              !isPro && entries.length > filtered.length ? (
                <Pressable style={styles.archiveBanner} onPress={() => router.push('/subscription' as any)}>
                  <Text style={styles.archiveBannerText}>Pro로 업그레이드하면 전체 기록을 볼 수 있어요</Text>
                </Pressable>
              ) : null
            }
          />
        )}
      </View>
    </GradientBackground>
  );
}

const entryStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    gap: 12,
  },
  dateCol: { alignItems: 'center', width: 52 },
  dateText: { color: '#F0F0F5', fontSize: 13, fontWeight: '600' },
  dayText: { color: '#8E8EA0', fontSize: 11, marginTop: 2 },
  contentCol: { flex: 1, gap: 6 },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  emotionDot: { width: 6, height: 6, borderRadius: 3 },
  emotionText: { fontSize: 11, fontWeight: '500' },
  dots: { flexDirection: 'row', gap: 3, marginLeft: 4 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  contextTag: { color: '#8E8EA0', fontSize: 11 },
  note: { color: '#5A5A6E', fontSize: 12 },
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { marginBottom: 8 },
  filterScroll: { maxHeight: 44, marginBottom: 16 },
  filterContent: { gap: 8, paddingRight: 24 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(74,158,255,0.15)',
    borderColor: '#4A9EFF',
  },
  filterText: { color: '#8E8EA0', fontSize: 13 },
  filterTextActive: { color: '#4A9EFF', fontWeight: '600' },
  list: { paddingBottom: 100 },
  separator: { height: 8 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#F0F0F5', fontSize: 17, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { color: '#8E8EA0', fontSize: 14, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, color: '#F0F0F5', fontSize: 14 },
  proSearchBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74,158,255,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, gap: 8 },
  proSearchText: { flex: 1, color: '#4A9EFF', fontSize: 13 },
  proBadge: { backgroundColor: 'rgba(74,158,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  proBadgeText: { color: '#4A9EFF', fontSize: 10, fontWeight: '700' },
  contextFilterScroll: { maxHeight: 44, marginBottom: 12 },
  archiveBanner: { padding: 16, backgroundColor: 'rgba(74,158,255,0.08)', borderRadius: 12, marginTop: 12, alignItems: 'center' },
  archiveBannerText: { color: '#4A9EFF', fontSize: 13 },
});
