import { ScrollView, Text, View, StyleSheet, Pressable, Switch, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useUserProfile, useUpdateUser } from '@/hooks/useApi';
import { signOut } from '@/lib/auth';

const PERSONA_OPTIONS = ['차분함', '따뜻함', '직접적', '유머러스'];

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

  const { data: user, isLoading } = useUserProfile();
  const updateUser = useUpdateUser();

  const displayName = user?.display_name ?? '-';
  const plan = user?.plan ?? 'Free';
  const currentPersona = user?.persona ?? '차분함';

  function cyclePersona() {
    const idx = PERSONA_OPTIONS.indexOf(currentPersona);
    const next = PERSONA_OPTIONS[(idx + 1) % PERSONA_OPTIONS.length];
    updateUser.mutate({ persona: next });
  }

  async function handleLogout() {
    Alert.alert('로그아웃', '정말 로그아웃하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await signOut();
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
          <SettingRow icon="person-outline" title="프로필" subtitle={displayName} />
          <SettingRow icon="card-outline" title="구독 관리" subtitle={plan} />
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
            subtitle={currentPersona}
            onPress={cyclePersona}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>데이터</Text>
          <SettingRow icon="download-outline" title="데이터 다운로드" />
          <SettingRow icon="trash-outline" title="데이터 삭제" />
          <SettingRow icon="shield-checkmark-outline" title="개인정보 처리방침" />
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
