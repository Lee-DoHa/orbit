import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { checkSession, getAccessToken } from '@/lib/auth';
import { useUserStore } from '@/stores/userStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  useEffect(() => {
    (async () => {
      try {
        const hasSession = await checkSession();
        if (hasSession) {
          // Restore session - parse token to get user info
          const token = await getAccessToken();
          // Decode JWT payload (base64url → JSON)
          const base64 = token.split('.')[1];
          const base64Fixed = base64.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = decodeURIComponent(
            atob(base64Fixed).split('').map(c =>
              '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
          );
          const payload = JSON.parse(decoded);
          setUser({
            id: payload.sub,
            email: payload.email,
            displayName: payload.email?.split('@')[0] || '',
          });
        }
      } catch {
        // No valid session
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [ready, isAuthenticated]);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0E1A' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="entry/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#0A0E1A' },
            headerTintColor: '#F0F0F5',
            headerTitle: '',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#0A0E1A' },
            headerTintColor: '#F0F0F5',
            headerTitle: '',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#0A0E1A' },
            headerTintColor: '#F0F0F5',
            headerTitle: '개인정보 처리방침',
            presentation: 'card',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
