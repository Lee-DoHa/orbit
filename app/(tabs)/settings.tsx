import { ScrollView, Text, View, StyleSheet, Pressable, Switch, ActivityIndicator, Alert, Platform, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useUserProfile, useUpdateUser } from '@/hooks/useApi';
import { signOut } from '@/lib/auth';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/lib/api';
import { entriesToCSV, downloadCSV } from '@/lib/export';
import { canUseFeature } from '@/lib/subscription';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/theme/tokens';

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
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const { data: user, isLoading, isError } = useUserProfile();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user?.reminder_enabled !== undefined) setReminder(user.reminder_enabled);
  }, [user?.reminder_enabled]);

  const displayName = user?.display_name || '이름을 설정해주세요';
  const plan = user?.subscription_tier === 'pro' ? 'Pro' : 'Free';
  const currentPersona = user?.persona ?? 'calm';
  const personaLabel = PERSONA_OPTIONS.find(p => p.key === currentPersona)?.label ?? '차분함';

  const isMutating = updateUser.isPending;

  function cyclePersona() {
    if (isMutating) return;
    const idx = PERSONA_OPTIONS.findIndex(p => p.key === currentPersona);
    const next = PERSONA_OPTIONS[(idx + 1) % PERSONA_OPTIONS.length];
    updateUser.mutate({ persona: next.key }, {
      onSuccess: () => Alert.alert('페르소나 변경', `AI 페르소나가 '${next.label}'(으)로 변경되었습니다.\n다음 Mirror 분석부터 적용됩니다.`),
      onError: () => Alert.alert('오류', '페르소나 변경에 실패했습니다.'),
    });
  }

  function handleEditProfile() {
    if (Platform.OS === 'web') {
      const name = prompt('프로필 이름을 입력하세요', !user?.display_name ? '' : displayName);
      if (name !== null && name.trim()) {
        updateUser.mutate({ display_name: name.trim() }, {
          onSuccess: () => Alert.alert('프로필 수정', '이름이 변경되었습니다.'),
          onError: () => Alert.alert('오류', '이름 변경에 실패했습니다.'),
        });
      }
    } else if (Platform.OS === 'ios') {
      Alert.prompt?.('프로필 편집', '이름을 입력하세요', (name) => {
        if (name?.trim()) updateUser.mutate({ display_name: name.trim() }, {
          onSuccess: () => Alert.alert('프로필 수정', '이름이 변경되었습니다.'),
          onError: () => Alert.alert('오류', '이름 변경에 실패했습니다.'),
        });
      }, 'plain-text', !user?.display_name ? '' : displayName);
    } else {
      // Android: use Modal with TextInput
      setNameInput(!user?.display_name ? '' : displayName);
      setShowNameModal(true);
    }
  }

  function handleSaveName() {
    if (nameInput.trim()) {
      updateUser.mutate({ display_name: nameInput.trim() }, {
        onSuccess: () => {
          setShowNameModal(false);
          Alert.alert('프로필 수정', '이름이 변경되었습니다.');
        },
        onError: () => Alert.alert('오류', '이름 변경에 실패했습니다.'),
      });
    }
  }

  async function handleDataExport() {
    const tier = (user?.subscription_tier || 'free') as 'free' | 'pro';
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
          <SettingRow
            icon="person-outline"
            title="프로필"
            subtitle={displayName}
            onPress={handleEditProfile}
            right={isMutating ? <ActivityIndicator size="small" color="#4A9EFF" /> : undefined}
          />
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
                disabled={isMutating}
                onValueChange={(val) => {
                  setReminder(val);
                  updateUser.mutate({ reminder_enabled: val }, {
                    onSuccess: () => Alert.alert('설정 저장', val ? '리마인더가 켜졌습니다.' : '리마인더가 꺼졌습니다.'),
                    onError: () => { setReminder(!val); Alert.alert('오류', '설정 변경에 실패했습니다.'); },
                  });
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
            right={isMutating ? <ActivityIndicator size="small" color="#4A9EFF" /> : undefined}
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
                  onPress: () => updateUser.mutate({ timezone: tz }, {
                    onSuccess: () => Alert.alert('설정 저장', `타임존이 ${tz}(으)로 변경되었습니다.`),
                    onError: () => Alert.alert('오류', '타임존 변경에 실패했습니다.'),
                  }),
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
          <SettingRow icon="information-circle-outline" title="버전" subtitle={Constants.expoConfig?.version ?? '1.0.0'} right={null} />
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Android/Web Name Edit Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>프로필 편집</Text>
            <Text style={styles.modalSubtitle}>이름을 입력하세요</Text>
            <TextInput
              style={styles.modalInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="이름"
              placeholderTextColor="#8E8EA0"
              autoFocus
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelButton} onPress={() => setShowNameModal(false)}>
                <Text style={styles.modalCancelText}>취소</Text>
              </Pressable>
              <Pressable style={styles.modalSaveButton} onPress={handleSaveName}>
                <Text style={styles.modalSaveText}>저장</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#F0F0F5',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#8E8EA0',
    fontSize: 13,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    color: '#F0F0F5',
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#8E8EA0',
    fontSize: 15,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#4A9EFF',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
