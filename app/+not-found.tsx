import { Link, Stack } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '페이지를 찾을 수 없습니다' }} />
      <View style={styles.container}>
        <Text style={styles.text}>이 화면은 존재하지 않습니다.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>홈으로 돌아가기</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E1A' },
  text: { color: '#F0F0F5', fontSize: 17 },
  link: { marginTop: 16, paddingVertical: 12 },
  linkText: { color: '#4A9EFF', fontSize: 15 },
});
