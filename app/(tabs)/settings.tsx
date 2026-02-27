import { ScrollView, Text, View, StyleSheet, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { SectionHeader } from '@/components/ui/SectionHeader';

type SettingRowProps = {
  icon: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

function SettingRow({ icon, title, subtitle, right }: SettingRowProps) {
  return (
    <Pressable style={styles.row}>
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
  const [reminder, setReminder] = useState(true);

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
          <SettingRow icon="person-outline" title="프로필" subtitle="이도하" />
          <SettingRow icon="card-outline" title="구독 관리" subtitle="Free" />
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
          <SettingRow icon="happy-outline" title="AI 페르소나" subtitle="차분함" />
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

        <View style={{ height: 32 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
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
});
