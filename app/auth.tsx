import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/theme/tokens';
import { signIn, signUp, confirmSignUp, forgotPassword, confirmNewPassword, resendConfirmationCode } from '@/lib/auth';
import { useUserStore } from '@/stores/userStore';

type Mode = 'login' | 'signup' | 'confirm' | 'forgot' | 'reset';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const session = await signIn(email, password);
      const sub = session.getIdToken().payload.sub;
      setUser({ id: sub, email, displayName: email.split('@')[0] });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('로그인 실패', err.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signUp(email, password);
      setMode('confirm');
    } catch (err: any) {
      Alert.alert('회원가입 실패', err.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmCode) return;
    setLoading(true);
    try {
      await confirmSignUp(email, confirmCode);
      Alert.alert('인증 완료', '로그인해주세요.');
      setMode('login');
    } catch (err: any) {
      Alert.alert('인증 실패', err.message || '코드를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('이메일 입력', '비밀번호를 재설정할 이메일을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert('인증 코드 발송', '이메일로 인증 코드가 발송되었습니다.');
      setMode('reset');
    } catch (err: any) {
      Alert.alert('오류', err.message || '인증 코드 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirmCode || !newPassword) return;
    setLoading(true);
    try {
      await confirmNewPassword(email, confirmCode, newPassword);
      Alert.alert('비밀번호 변경 완료', '새 비밀번호로 로그인해주세요.');
      setConfirmCode('');
      setNewPassword('');
      setMode('login');
    } catch (err: any) {
      Alert.alert('비밀번호 변경 실패', err.message || '코드를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await resendConfirmationCode(email);
      Alert.alert('재발송 완료', '인증 코드가 다시 발송되었습니다.');
    } catch (err: any) {
      Alert.alert('재발송 실패', err.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>ORBIT</Text>
          <Text style={styles.subtitle}>감정을 구조화하는 개인 운영 체제</Text>
        </View>

        <View style={styles.form}>
          {mode === 'confirm' ? (
            <>
              <Text style={styles.label}>{email}로 전송된 인증 코드를 입력하세요</Text>
              <TextInput
                style={styles.input}
                placeholder="인증 코드"
                placeholderTextColor={colors.text.tertiary}
                value={confirmCode}
                onChangeText={setConfirmCode}
                keyboardType="number-pad"
                autoFocus
              />
              <CosmicButton title="인증하기" onPress={handleConfirm} disabled={loading || !confirmCode} />
              <CosmicButton
                title="인증 코드 재발송"
                variant="ghost"
                onPress={handleResendCode}
                disabled={loading}
              />
            </>
          ) : mode === 'forgot' ? (
            <>
              <Text style={styles.label}>비밀번호를 재설정할 이메일을 입력하세요</Text>
              <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <CosmicButton title="인증 코드 발송" onPress={handleForgotPassword} disabled={loading || !email} />
              <CosmicButton
                title="로그인으로 돌아가기"
                variant="ghost"
                onPress={() => setMode('login')}
              />
            </>
          ) : mode === 'reset' ? (
            <>
              <Text style={styles.label}>{email}로 전송된 인증 코드와 새 비밀번호를 입력하세요</Text>
              <TextInput
                style={styles.input}
                placeholder="인증 코드"
                placeholderTextColor={colors.text.tertiary}
                value={confirmCode}
                onChangeText={setConfirmCode}
                keyboardType="number-pad"
                autoFocus
              />
              <TextInput
                style={styles.input}
                placeholder="새 비밀번호 (8자 이상)"
                placeholderTextColor={colors.text.tertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <CosmicButton title="비밀번호 변경" onPress={handleResetPassword} disabled={loading || !confirmCode || !newPassword} />
              <CosmicButton
                title="로그인으로 돌아가기"
                variant="ghost"
                onPress={() => setMode('login')}
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 (8자 이상)"
                placeholderTextColor={colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {mode === 'login' ? (
                <>
                  <CosmicButton title="로그인" onPress={handleLogin} disabled={loading} />
                  <CosmicButton
                    title="비밀번호를 잊으셨나요?"
                    variant="ghost"
                    onPress={() => setMode('forgot')}
                  />
                  <CosmicButton
                    title="계정이 없으신가요? 회원가입"
                    variant="ghost"
                    onPress={() => setMode('signup')}
                  />
                </>
              ) : (
                <>
                  <CosmicButton title="회원가입" onPress={handleSignUp} disabled={loading} />
                  <CosmicButton
                    title="이미 계정이 있으신가요? 로그인"
                    variant="ghost"
                    onPress={() => setMode('login')}
                  />
                </>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    color: colors.accent.blue,
    letterSpacing: 8,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  form: {
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.md,
  },
});
