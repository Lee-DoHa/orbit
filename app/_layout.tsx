import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
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
      </Stack>
    </QueryClientProvider>
  );
}
