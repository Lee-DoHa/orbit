import { ScrollView, View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { colors, spacing, fontSize, fontWeight } from '@/theme/tokens';

const CONTACT_EMAIL = 'orbit.app.kr@gmail.com';

const SECTIONS: { title: string; body: string; hasEmail?: boolean }[] = [
  {
    title: '1. 수집하는 개인정보',
    body: 'ORBIT은 서비스 제공을 위해 다음의 개인정보를 수집합니다.\n\n• 이메일 주소 (회원가입 및 로그인)\n• 감정 기록 데이터 (감정 종류, 강도, 상황, 메모)\n• 앱 사용 데이터 (기록 빈도, 기능 사용 패턴)',
  },
  {
    title: '2. 개인정보의 이용 목적',
    body: '수집된 개인정보는 다음의 목적으로만 이용됩니다.\n\n• 서비스 제공 및 계정 관리\n• 감정 분석 및 개인화된 인사이트 생성\n• 서비스 개선 및 사용자 경험 향상',
  },
  {
    title: '3. 개인정보의 보관',
    body: '• 모든 데이터는 AWS 서울 리전(ap-northeast-2)에 암호화되어 저장됩니다.\n• 회원 탈퇴 시 모든 개인정보는 30일 이내에 완전히 파기됩니다.\n• 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 동안 별도 보관 후 파기합니다.',
  },
  {
    title: '4. AI 데이터 처리',
    body: '• Mirror 분석 시 OpenAI API를 호출하여 감정 데이터를 처리합니다.\n• API 호출 시 감정 기록 데이터만 전달되며, 이메일 등 개인 식별 정보는 포함되지 않습니다.\n• OpenAI는 API를 통해 전달된 데이터를 모델 학습에 사용하지 않습니다.',
  },
  {
    title: '5. 제3자 제공',
    body: '• ORBIT은 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.\n• 법률에 의해 요구되는 경우를 제외하고, 사용자의 명시적 동의 없이는 어떠한 정보도 외부에 공개하지 않습니다.',
  },
  {
    title: '6. 사용자 권리',
    body: '사용자는 언제든지 다음의 권리를 행사할 수 있습니다.\n\n• 개인정보 열람 요청\n• 개인정보 수정 요청\n• 개인정보 삭제 요청 (앱 내 설정 > 데이터 삭제)\n• 서비스 탈퇴 (앱 내 설정 > 계정 삭제)',
  },
  {
    title: '7. 연락처',
    body: '개인정보 관련 문의사항은 아래 이메일로 연락해주세요.',
    hasEmail: true,
  },
  {
    title: '8. 시행일',
    body: '본 개인정보 처리방침은 2026년 3월 1일부터 시행됩니다.',
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>ORBIT 개인정보 처리방침</Text>

        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
            {section.hasEmail && (
              <Pressable
                style={styles.emailLink}
                onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
              >
                <Text style={styles.emailText}>{CONTACT_EMAIL}</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.accent.blue,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  emailLink: {
    marginTop: spacing.sm,
  },
  emailText: {
    fontSize: fontSize.sm,
    color: colors.accent.blue,
    textDecorationLine: 'underline',
  },
});
