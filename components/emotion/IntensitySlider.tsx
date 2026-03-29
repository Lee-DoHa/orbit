import { View, Text, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { useRef, useCallback } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize, letterSpacing, animation } from '@/theme/tokens';
import { MIN_INTENSITY, MAX_INTENSITY } from '@/lib/constants';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

function IntensitySegment({
  level,
  isActive,
  isCurrent,
  levelColor,
  previousLevelColor,
  onPress,
}: {
  level: number;
  isActive: boolean;
  isCurrent: boolean;
  levelColor: string;
  previousLevelColor: string | null;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: animation.duration.fast,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        speed: 16,
        bounciness: 8,
      }),
    ]).start();
    onPress();
  }, [onPress, scaleAnim]);

  // Subtle gradient effect: active segments blend slightly with previous level color
  const bgColor = isActive
    ? previousLevelColor
      ? levelColor
      : levelColor
    : colors.surface.card;

  const currentBorderStyle = isCurrent
    ? {
        borderColor: levelColor,
        borderWidth: 2.5,
        shadowColor: levelColor,
        shadowOffset: { width: 0, height: 0 } as const,
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 3,
      }
    : {};

  const webGlow =
    isCurrent && Platform.OS === 'web'
      ? { boxShadow: `0 0 12px 1px ${levelColor}50` }
      : {};

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.segment,
          { backgroundColor: bgColor },
          isActive && {
            opacity: isCurrent ? 1 : 0.7 + (level / MAX_INTENSITY) * 0.3,
          },
          currentBorderStyle,
          webGlow as any,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            { color: colors.text.tertiary },
            isActive && { color: colors.text.inverse, fontWeight: '700' },
          ]}
        >
          {level}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function IntensitySlider({ value, onChange }: Props) {
  const { colors } = useTheme();

  const levels = Array.from(
    { length: MAX_INTENSITY - MIN_INTENSITY + 1 },
    (_, i) => i + MIN_INTENSITY
  );

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {levels.map((level) => {
          const isActive = level <= value;
          const isCurrent = level === value;
          const levelColor = colors.intensity[level as keyof typeof colors.intensity];
          const previousLevelColor =
            level > MIN_INTENSITY
              ? colors.intensity[(level - 1) as keyof typeof colors.intensity]
              : null;

          return (
            <IntensitySegment
              key={level}
              level={level}
              isActive={isActive}
              isCurrent={isCurrent}
              levelColor={levelColor}
              previousLevelColor={previousLevelColor}
              onPress={() => onChange(level)}
            />
          );
        })}
      </View>
      <View style={styles.labels}>
        <Text style={[styles.labelText, { color: colors.text.tertiary }]}>낮음</Text>
        <Text style={[styles.labelText, { color: colors.text.tertiary }]}>높음</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  track: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    height: 44,
    minWidth: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    letterSpacing: letterSpacing.wide,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wider,
    fontWeight: '500',
  },
});
