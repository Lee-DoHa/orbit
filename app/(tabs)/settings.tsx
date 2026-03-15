import { ScrollView, Text, View, StyleSheet, Pressable, Switch, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useUserProfile, useUpdateUser } from '@/hooks/useApi';
import { signOut } from '@/lib/auth';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/lib/api';
import { entriesToCSV, downloadCSV } from '@/lib/export';
import { canUseFeature } from '@/lib/subscription';

const PERSONA_OPTIONS = [
  { key: 'calm', label: '차분함' },
  { key: 'cheer', label: '따뜻함' },
  { key: 'rational', label: '직접적' },
] as const;

type SettingRowProps = {
  icon: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
};

function SettingRow({ icon, title, subtitle, right, onPress }: SettingRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon as any} size={22} color="#8E8EA0" />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color="#5A5A6E" />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [reminder, setReminder] = useState(true);

  const { data: user, isLoading, isError } = useUserProfile();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user?.reminder_enabled !== undefined) setReminder(user.reminder_enabled);
  }, [user?.reminder_enabled]);

  const displayName = user?.display_name ?? '-';
  const plan = user?.subscription_tier === 'pro' ? 'Pro' : 'Free';
  const currentPersona = user?.persona ?? 'calm';
  const personaLabel = PERSONA_OPTIONS.find(p => p.key === currentPersona)?.label ?? '차분함';

  function cyclePersona() {
    const idx = PERSONA_OPTIONS.findIndex(p => p.key === currentPersona);
    const next = PERSONA_OPTIONS[(idx + 1) % PERSONA_OPTIONS.length];
    updateUser.mutate({ persona: next.key });
  }

  function handleEditProfile() {
    if (Platform.OS === 'web') {
      const name = prompt('프로필 이름을 입력하세요', displayName === '-' ? '' : displayName);
      if (name !== null && name.trim()) {
        updateUser.mutate({ display_name: name.trim() });
      }
    } else {
      Alert.prompt?.('프로필 편집', '이름을 입력하세요', (name) => {
        if (name?.trim()) updateUser.mutate({ display_name: name.trim() });
      }, 'plain-text', displayName === '-' ? '' : displayName) ??
        Alert.alert('프로필 편집', '이 기능은 앱에서 사용 가능합니다.');
    }
  }

  async function handleDataExport() {
    const tier = (user?.subscription_tier || 'free') as any;
    if (!canUseFeature(tier, 'data_export')) {
      Alert.alert('Pro 기능', 'CSV 내보내기는 Pro 플랜에서 사용할 수 있어요.', [
        { text: '닫기', style: 'cancel' },
        { text: 'Pro 알아보기', onPress: () => router.push('/subscription') },
      ]);
      return;
    }
    try {
      const entries = await api.entries.list({ limit: 9999 });
      const csv = entriesToCSV(entries);
      const filename = `orbit-감정기록-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCSV(csv, filename);
      Alert.alert('내보내기 완료', 'CSV 파일이 다운로드되었습니다.');
    } catch {
      Alert.alert('오류', '데이터를 불러올 수 없습니다.');
    }
  }

  async function handleDataDelete() {
    Alert.alert(
      '계정 삭제',
      '모든 감정 기록, AI 분석, 인사이트가 영구 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '계정 삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('최종 확인', '정말로 계정을 삭제하시겠어요?', [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제 확인',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await api.users.delete();
                    await signOut();
                    useUserStore.getState().logout();
                    router.replace('/auth');
                  } catch {
                    Alert.alert('오류', '계정 삭제에 실패했습니다. 다시 시도해주세요.');
                  }
                },
              },
            ]);
          },
        },
      ]
    );
  }

  function handlePrivacy() {
    router.push('/privacy');
  }

  async function handleLogout() {
    Alert.alert('로그아웃', '정말 로그아웃하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          useUserStore.getState().logout();
          router.replace('/auth');
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 16 }]}>
          <ActivityIndicator size="large" color="#4A9EFF" />
        </View>
      </GradientBackground>
    );
  }

  if (isError) {
    // Still show settings UI even if profile fetch fails
  }

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="설정" />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>계정</Text>
          <SettingRow icon="person-outline" title="프로필" subtitle={displayName} onPress={handleEditProfile} />
          <SettingRow icon="card-outline" title="구독 관리" subtitle={plan} onPress={() => router.push('/subscription')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>기록</Text>
          <SettingRow
            icon="notifications-outline"
            title="기록 리마인드"
            right={
              <Switch
                value={reminder}
                onValueChange={(val) => {
                  setReminder(val);
                  updateUser.mutate({ reminder_enabled: val } as any);
                }}
                trackColor={{ false: '#333', true: '#4A9EFF' }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon="happy-outline"
            title="AI 페르소나"
            subtitle={personaLabel}
            onPress={cyclePersona}
          />
          <SettingRow
            icon="time-outline"
            title="타임존"
            subtitle={user?.timezone || 'Asia/Seoul'}
            onPress={() => {
              const timezones = ['Asia/Seoul', 'Asia/Tokyo', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin'];
              Alert.alert('타임존 설정', '사용할 타임존을 선택하세요',
                timezones.map(tz => ({
                  text: tz,
                  onPress: () => updateUser.mutate({ timezone: tz }),
                })).concat([{ text: '취소', style: 'cancel' as any, onPress: undefined as any }])
              );
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>데이터</Text>
          <SettingRow icon="download-outline" title="데이터 다운로드" onPress={handleDataExport} />
          <SettingRow icon="trash-outline" title="데이터 삭제" onPress={handleDataDelete} />
          <SettingRow icon="shield-checkmark-outline" title="개인정보 처리방침" onPress={handlePrivacy} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>앱 정보</Text>
          <SettingRow icon="information-circle-outline" title="버전" subtitle="1.0.0" right={null} />
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  sectionLabel: { color: '#8E8EA0', fontSize: 12, fontWeight: '600', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowText: { flex: 1 },
  rowTitle: { color: '#F0F0F5', fontSize: 15 },
  rowSubtitle: { color: '#8E8EA0', fontSize: 12, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.15)',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
});
