import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize } from '@/theme/tokens';

export function MirrorLoading() {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const pulseOpacity = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    const pulseScale = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.02, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(scale, { toValue: 0.95, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    pulseOpacity.start();
    pulseScale.start();
    return () => { pulseOpacity.stop(); pulseScale.stop(); };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface.card,
          borderColor: colors.accent.blueSubtle,
        },
        { opacity, transform: [{ scale }] },
      ]}
    >
      <View
        style={[
          styles.glowDot,
          {
            backgroundColor: colors.accent.blue,
            shadowColor: colors.accent.blue,
          },
        ]}
      />
      <Text style={[styles.text, { color: colors.text.secondary }]}>
        감정을 구조화하고 있어요...
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 16,
  },
  glowDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  text: {
    fontSize: fontSize.sm,
  },
});
