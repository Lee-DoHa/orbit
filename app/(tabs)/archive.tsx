import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useEntries, useUserProfile } from '@/hooks/useApi';
import { canUseFeature } from '@/lib/subscription';
import { CONTEXTS } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeContext';

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
  const { colors } = useTheme();
  const intensityColor = colors.intensity[value as keyof typeof colors.intensity] || colors.status.warning;
  return (
    <View style={entryStyles.dots}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            entryStyles.dot,
            { backgroundColor: colors.surface.cardHover },
            i <= value && { backgroundColor: intensityColor },
          ]}
        />
      ))}
    </View>
  );
}

function EntryCard({ item, onPress }: { item: EntryItem; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[entryStyles.card, { backgroundColor: colors.surface.card }]} onPress={onPress}>
      <View style={entryStyles.dateCol}>
        <Text style={[entryStyles.dateText, { color: colors.text.primary }]}>{item.date}</Text>
        <Text style={[entryStyles.dayText, { color: colors.text.secondary }]}>{item.dayOfWeek}</Text>
      </View>
      <View style={entryStyles.contentCol}>
        <View style={entryStyles.emotionRow}>
          {item.emotions.map((e) => {
            const emotionColor = colors.emotion[e as keyof typeof colors.emotion] || colors.text.secondary;
            return (
              <View
                key={e}
                style={[
                  entryStyles.emotionBadge,
                  { backgroundColor: emotionColor + '20' },
                ]}
              >
                <View
                  style={[
                    entryStyles.emotionDot,
                    { backgroundColor: emotionColor },
                  ]}
                />
                <Text
                  style={[
                    entryStyles.emotionText,
                    { color: emotionColor },
                  ]}
                >
                  {e}
                </Text>
              </View>
            );
          })}
          <IntensityDots value={item.intensity} />
        </View>
        <Text style={[entryStyles.contextTag, { color: colors.text.secondary }]}>{item.context}</Text>
        {item.note && (
          <Text style={[entryStyles.note, { color: colors.text.tertiary }]} numberOfLines={1}>
            {item.note}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
    </Pressable>
  );
}

const FILTER_OPTIONS = ['전체', '긴장', '불안', '안정', '피로', '집중', '만족', '설렘', '무기력', '외로움', '혼란'];

export default function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [filter, setFilter] = useState('전체');
  const [searchText, setSearchText] = useState('');
  const [contextFilter, setContextFilter] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: entries = [], isLoading, isError, refetch } = useEntries();
  const { data: user } = useUserProfile();
  const tier = (user?.subscription_tier || 'free') as 'free' | 'pro';
  const isPro = tier === 'pro';

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

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

  // Pro: search (debounced)
  if (debouncedSearch && isPro) {
    const q = debouncedSearch.toLowerCase();
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
              style={[styles.filterChip, { backgroundColor: colors.surface.card, borderColor: colors.surface.cardBorder }, filter === f && { backgroundColor: colors.accent.blueSubtle, borderColor: colors.accent.blue }]}
            >
              <Text style={[styles.filterText, { color: colors.text.secondary }, filter === f && { color: colors.accent.blue, fontWeight: '600' }]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isPro ? (
          <View style={[styles.searchContainer, { backgroundColor: colors.surface.card }]}>
            <Ionicons name="search-outline" size={18} color={colors.text.secondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="기록 검색..."
              placeholderTextColor={colors.text.tertiary}
              value={searchText}
              onChangeText={handleSearchChange}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => { setSearchText(''); setDebouncedSearch(''); if (searchTimerRef.current) clearTimeout(searchTimerRef.current); }}>
                <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable style={[styles.proSearchBanner, { backgroundColor: colors.accent.blueSubtle }]} onPress={() => router.push('/subscription' as any)}>
            <Ionicons name="search-outline" size={16} color={colors.accent.blue} />
            <Text style={[styles.proSearchText, { color: colors.accent.blue }]}>검색 및 고급 필터</Text>
            <View style={[styles.proBadge, { backgroundColor: `${colors.accent.blue}33` }]}>
              <Text style={[styles.proBadgeText, { color: colors.accent.blue }]}>PRO</Text>
            </View>
          </Pressable>
        )}

        {isPro ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contextFilterScroll}>
            <Pressable
              onPress={() => setContextFilter(null)}
              style={[styles.filterChip, { backgroundColor: colors.surface.card, borderColor: colors.surface.cardBorder }, !contextFilter && { backgroundColor: colors.accent.blueSubtle, borderColor: colors.accent.blue }]}
            >
              <Text style={[styles.filterText, { color: colors.text.secondary }, !contextFilter && { color: colors.accent.blue, fontWeight: '600' }]}>전체 상황</Text>
            </Pressable>
            {CONTEXTS.map(c => (
              <Pressable
                key={c.id}
                onPress={() => setContextFilter(c.name === contextFilter ? null : c.name)}
                style={[styles.filterChip, { backgroundColor: colors.surface.card, borderColor: colors.surface.cardBorder }, contextFilter === c.name && { backgroundColor: colors.accent.blueSubtle, borderColor: colors.accent.blue }]}
              >
                <Text style={[styles.filterText, { color: colors.text.secondary }, contextFilter === c.name && { color: colors.accent.blue, fontWeight: '600' }]}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Pressable style={styles.contextHintBanner} onPress={() => router.push('/subscription' as any)}>
            <Ionicons name="filter-outline" size={14} color={colors.text.secondary} />
            <Text style={[styles.contextHintText, { color: colors.text.secondary }]}>Pro 플랜에서 상황별 필터를 사용할 수 있어요</Text>
          </Pressable>
        )}

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent.blue} />
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>기록을 불러올 수 없어요</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>네트워크 연결을 확인해주세요</Text>
            <Pressable style={[styles.retryButton, { backgroundColor: colors.accent.blueSubtle, borderColor: `${colors.accent.blue}4D` }]} onPress={() => refetch()}>
              <Ionicons name="refresh-outline" size={18} color={colors.accent.blue} />
              <Text style={[styles.retryButtonText, { color: colors.accent.blue }]}>다시 시도</Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌙</Text>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>아직 기록이 없어요</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>오늘 탭에서 첫 감정을 기록해보세요</Text>
            <Pressable style={[styles.emptyActionButton, { backgroundColor: colors.accent.blue }]} onPress={() => router.push('/(tabs)')}>
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.emptyActionButtonText}>감정 기록하기</Text>
            </Pressable>
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
                <Pressable style={[styles.archiveBanner, { backgroundColor: colors.accent.blueSubtle }]} onPress={() => router.push('/subscription' as any)}>
                  <Text style={[styles.archiveBannerText, { color: colors.accent.blue }]}>Pro로 업그레이드하면 전체 기록을 볼 수 있어요</Text>
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
    borderRadius: 16,
    gap: 12,
  },
  dateCol: { alignItems: 'center', width: 52 },
  dateText: { fontSize: 13, fontWeight: '600' },
  dayText: { fontSize: 11, marginTop: 2 },
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
  },
  contextTag: { fontSize: 11 },
  note: { fontSize: 12 },
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
    borderWidth: 1,
  },
  filterText: { fontSize: 13 },
  list: { paddingBottom: 100 },
  separator: { height: 8 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  proSearchBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, gap: 8 },
  proSearchText: { flex: 1, fontSize: 13 },
  proBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  proBadgeText: { fontSize: 10, fontWeight: '700' },
  contextFilterScroll: { maxHeight: 44, marginBottom: 12 },
  archiveBanner: { padding: 16, borderRadius: 12, marginTop: 12, alignItems: 'center' },
  archiveBannerText: { fontSize: 13 },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  retryButtonText: { fontSize: 14, fontWeight: '600' },
  emptyActionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyActionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  contextHintBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  contextHintText: { fontSize: 12 },
});
