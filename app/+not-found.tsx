import { Link, Stack } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: '페이지를 찾을 수 없습니다' }} />
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.text, { color: colors.text.primary }]}>이 화면은 존재하지 않습니다.</Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.accent.blue }]}>홈으로 돌아가기</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 17 },
  link: { marginTop: 16, paddingVertical: 12 },
  linkText: { fontSize: 15 },
});
