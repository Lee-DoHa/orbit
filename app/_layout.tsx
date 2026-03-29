import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { checkSession, getAccessToken } from '@/lib/auth';
import { useUserStore } from '@/stores/userStore';
import { initRevenueCat } from '@/lib/revenueCat';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RootNavigator() {
  const [ready, setReady] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const hasSession = await checkSession();
        if (hasSession) {
          const token = await getAccessToken();
          const base64 = token.split('.')[1];
          const base64Fixed = base64.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = decodeURIComponent(
            atob(base64Fixed)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(decoded);
          setUser({
            id: payload.sub,
            email: payload.email,
            displayName: payload.email?.split('@')[0] || '',
          });
          initRevenueCat(payload.sub).catch(() => {});
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
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="entry/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.background.primary },
            headerTintColor: colors.text.primary,
            headerTitle: '',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.background.primary },
            headerTintColor: colors.text.primary,
            headerTitle: '',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.background.primary },
            headerTintColor: colors.text.primary,
            headerTitle: '개인정보 처리방침',
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
