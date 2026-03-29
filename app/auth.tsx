import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { useTheme } from '@/theme/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '@/theme/tokens';
import { signIn, signUp, confirmSignUp, forgotPassword, confirmNewPassword, resendConfirmationCode, isConfigured } from '@/lib/auth';
import { useUserStore } from '@/stores/userStore';

type Mode = 'login' | 'signup' | 'confirm' | 'forgot' | 'reset';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getKoreanError(err: any): string {
  const msg = err?.message || err?.toString() || '';
  if (msg.includes('User already exists')) return '이미 가입된 이메일입니다.';
  if (msg.includes('Password did not conform')) return '비밀번호는 8자 이상, 대소문자와 숫자를 포함해야 합니다.';
  if (msg.includes('Invalid parameter')) return '입력값을 확인해주세요.';
  if (msg.includes('Username cannot be empty')) return '이메일을 입력해주세요.';
  if (msg.includes('Incorrect username or password')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (msg.includes('User is not confirmed')) return '이메일 인증이 완료되지 않았습니다. 인증 코드를 입력해주세요.';
  if (msg.includes('Code mismatch')) return '인증 코드가 올바르지 않습니다.';
  if (msg.includes('Expired')) return '인증 코드가 만료되었습니다. 재발송해주세요.';
  if (msg.includes('Limit exceeded')) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  if (msg.includes('Network')) return '네트워크 연결을 확인해주세요.';
  if (msg.includes('not configured') || msg.includes('Not configured')) return 'Cognito가 설정되지 않았습니다. 환경변수를 확인해주세요.';
  return msg || '알 수 없는 오류가 발생했습니다.';
}

export default function AuthScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const setUser = useUserStore((s) => s.setUser);

  const passwordRef = useRef<TextInput>(null);
  const confirmCodeRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateEmail = useCallback((): boolean => {
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('이메일 형식 오류', '올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    return true;
  }, [email]);

  const handleLogin = async () => {
    if (!email || !password) return;
    if (!validateEmail()) return;
    setLoading(true);
    try {
      const session = await signIn(email.trim(), password);
      const sub = session.getIdToken().payload.sub;
      setUser({ id: sub, email: email.trim(), displayName: email.split('@')[0] });
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err?.message?.includes('User is not confirmed')) {
        setMode('confirm');
        Alert.alert('이메일 인증 필요', '회원가입 시 전송된 인증 코드를 입력해주세요.');
      } else {
        Alert.alert('로그인 실패', getKoreanError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    if (!validateEmail()) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      setMode('confirm');
    } catch (err: any) {
      Alert.alert('회원가입 실패', getKoreanError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmCode) return;
    setLoading(true);
    try {
      await confirmSignUp(email.trim(), confirmCode);
      Alert.alert('인증 완료', '로그인해주세요.');
      setMode('login');
    } catch (err: any) {
      Alert.alert('인증 실패', getKoreanError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('이메일 입력', '비밀번호를 재설정할 이메일을 입력해주세요.');
      return;
    }
    if (!validateEmail()) return;
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      Alert.alert('인증 코드 발송', '이메일로 인증 코드가 발송되었습니다.');
      setMode('reset');
      setResendCooldown(60);
    } catch (err: any) {
      Alert.alert('오류', getKoreanError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirmCode || !newPassword) return;
    setLoading(true);
    try {
      await confirmNewPassword(email.trim(), confirmCode, newPassword);
      Alert.alert('비밀번호 변경 완료', '새 비밀번호로 로그인해주세요.');
      setConfirmCode('');
      setNewPassword('');
      setMode('login');
    } catch (err: any) {
      Alert.alert('비밀번호 변경 실패', getKoreanError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;
    setLoading(true);
    try {
      await resendConfirmationCode(email.trim());
      setResendCooldown(60);
      Alert.alert('재발송 완료', '인증 코드가 다시 발송되었습니다.');
    } catch (err: any) {
      Alert.alert('재발송 실패', getKoreanError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.surface.card,
      borderColor: colors.surface.cardBorder,
      color: colors.text.primary,
    },
  ];

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.accent.blue }]}>ORBIT</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>감정을 구조화하는 개인 운영 체제</Text>
        </View>

        <View style={styles.form}>
          {mode === 'confirm' ? (
            <>
              <Text style={[styles.label, { color: colors.text.secondary }]}>{email}로 전송된 인증 코드를 입력하세요</Text>
              <TextInput
                ref={confirmCodeRef}
                style={inputStyle}
                placeholder="인증 코드"
                placeholderTextColor={colors.text.tertiary}
                value={confirmCode}
                onChangeText={setConfirmCode}
                keyboardType="number-pad"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
              />
              <CosmicButton title="인증하기" onPress={handleConfirm} disabled={loading || !confirmCode} />
              <CosmicButton
                title={resendCooldown > 0 ? `재발송 (${resendCooldown}초)` : '인증 코드 재발송'}
                variant="ghost"
                onPress={handleResendCode}
                disabled={loading || resendCooldown > 0}
              />
            </>
          ) : mode === 'forgot' ? (
            <>
              <Text style={[styles.label, { color: colors.text.secondary }]}>비밀번호를 재설정할 이메일을 입력하세요</Text>
              <TextInput
                style={inputStyle}
                placeholder="이메일"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleForgotPassword}
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
              <Text style={[styles.label, { color: colors.text.secondary }]}>{email}로 전송된 인증 코드와 새 비밀번호를 입력하세요</Text>
              <TextInput
                ref={confirmCodeRef}
                style={inputStyle}
                placeholder="인증 코드"
                placeholderTextColor={colors.text.tertiary}
                value={confirmCode}
                onChangeText={setConfirmCode}
                keyboardType="number-pad"
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={newPasswordRef}
                  style={[...inputStyle, styles.passwordInput]}
                  placeholder="새 비밀번호 (8자 이상)"
                  placeholderTextColor={colors.text.tertiary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  hitSlop={8}
                >
                  <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.text.tertiary} />
                </Pressable>
              </View>
              <CosmicButton title="비밀번호 변경" onPress={handleResetPassword} disabled={loading || !confirmCode || !newPassword} />
              <CosmicButton
                title={resendCooldown > 0 ? `재발송 (${resendCooldown}초)` : '인증 코드 재발송'}
                variant="ghost"
                onPress={handleResendCode}
                disabled={loading || resendCooldown > 0}
              />
              <CosmicButton
                title="로그인으로 돌아가기"
                variant="ghost"
                onPress={() => setMode('login')}
              />
            </>
          ) : (
            <>
              <TextInput
                style={inputStyle}
                placeholder="이메일"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  style={[...inputStyle, styles.passwordInput]}
                  placeholder={mode === 'signup' ? "비밀번호 (8자 이상, 대소문자+숫자)" : "비밀번호 (8자 이상)"}
                  placeholderTextColor={colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={mode === 'login' ? handleLogin : handleSignUp}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.text.tertiary} />
                </Pressable>
              </View>
              {mode === 'login' ? (
                <>
                  <CosmicButton title="로그인" onPress={handleLogin} disabled={loading} />
                  <CosmicButton title="비밀번호를 잊으셨나요?" variant="ghost" onPress={() => setMode('forgot')} />
                  <CosmicButton title="계정이 없으신가요? 회원가입" variant="ghost" onPress={() => setMode('signup')} />
                </>
              ) : (
                <>
                  <CosmicButton title="회원가입" onPress={handleSignUp} disabled={loading} />
                  <CosmicButton title="이미 계정이 있으신가요? 로그인" variant="ghost" onPress={() => setMode('login')} />
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
    letterSpacing: 8,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  form: {
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
});
