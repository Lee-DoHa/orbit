import { ScrollView, Text, View, StyleSheet, Pressable, Switch, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useUserProfile, useUpdateUser } from '@/hooks/useApi';
import { signOut } from '@/lib/auth';
import { useUserStore } from '@/stores/userStore';

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

  function handleDataExport() {
    Alert.alert('데이터 다운로드', '이 기능은 추후 업데이트에서 지원될 예정이에요.');
  }

  function handleDataDelete() {
    Alert.alert(
      '데이터 삭제',
      '모든 감정 기록과 인사이트가 삭제됩니다. 이 작업은 되돌릴 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => {
          Alert.alert('안내', '데이터 삭제 기능은 추후 업데이트에서 지원될 예정이에요.');
        }},
      ]
    );
  }

  function handlePrivacy() {
    Alert.alert('개인정보 처리방침', 'ORBIT은 사용자의 감정 데이터를 안전하게 보호합니다. 자세한 내용은 추후 공개될 예정이에요.');
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
          <SettingRow icon="card-outline" title="구독 관리" subtitle={plan} onPress={() => Alert.alert('구독 관리', '현재 Free 플랜을 사용 중이에요. Pro 플랜은 추후 제공될 예정입니다.')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>기록</Text>
          <SettingRow
            icon="notifications-outline"
            title="기록 리마인드"
            right={
              <Switch
                value={reminder}
                onValueChange={setReminder}
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
