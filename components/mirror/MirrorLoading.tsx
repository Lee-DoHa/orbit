import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize, letterSpacing, animation } from '@/theme/tokens';

export function MirrorLoading() {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const ring2Scale = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    const pulseOpacity = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: useNative }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: useNative }),
      ])
    );
    const pulseScale = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.02, duration: 1500, useNativeDriver: useNative }),
        Animated.timing(scale, { toValue: 0.95, duration: 1500, useNativeDriver: useNative }),
      ])
    );
    // Primary ring: expands and fades out
    const pulseRing = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 1.8, duration: animation.duration.spring * 2.4, useNativeDriver: useNative }),
          Animated.timing(ringOpacity, { toValue: 0, duration: animation.duration.spring * 2.4, useNativeDriver: useNative }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 0.8, duration: 0, useNativeDriver: useNative }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 0, useNativeDriver: useNative }),
        ]),
      ])
    );
    // Secondary ring: smaller, offset timing
    const pulseRing2 = Animated.loop(
      Animated.sequence([
        Animated.delay(animation.duration.spring * 0.8),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 1.5, duration: animation.duration.spring * 2, useNativeDriver: useNative }),
          Animated.timing(ring2Opacity, { toValue: 0, duration: animation.duration.spring * 2, useNativeDriver: useNative }),
        ]),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 0.6, duration: 0, useNativeDriver: useNative }),
          Animated.timing(ring2Opacity, { toValue: 0.4, duration: 0, useNativeDriver: useNative }),
        ]),
      ])
    );

    pulseOpacity.start();
    pulseScale.start();
    pulseRing.start();
    pulseRing2.start();

    return () => {
      pulseOpacity.stop();
      pulseScale.stop();
      pulseRing.stop();
      pulseRing2.stop();
    };
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
      <View style={styles.dotWrapper}>
        {/* Secondary pulsing ring (smaller) */}
        <Animated.View
          style={[
            styles.ring,
            styles.ringSmall,
            {
              borderColor: colors.glow.indigo,
              opacity: ring2Opacity,
              transform: [{ scale: ring2Scale }],
            },
          ]}
        />
        {/* Primary pulsing ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              borderColor: colors.glow.indigo,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        {/* Glow dot */}
        <View
          style={[
            styles.glowDot,
            {
              backgroundColor: colors.glow.indigo,
              shadowColor: colors.accent.blue,
            },
          ]}
        >
          <View
            style={[
              styles.glowDotInner,
              { backgroundColor: colors.accent.blue },
            ]}
          />
        </View>
      </View>
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
  dotWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  ringSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  glowDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDotInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  text: {
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
});
