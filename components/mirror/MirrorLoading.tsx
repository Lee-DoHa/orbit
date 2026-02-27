import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, fontSize } from '@/theme/tokens';

export function MirrorLoading() {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.glowDot} />
      <Text style={styles.text}>감정을 구조화하고 있어요...</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.accent.blueGlow,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 16,
  },
  glowDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.blue,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  text: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
});
