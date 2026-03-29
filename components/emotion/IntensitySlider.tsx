import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '@/theme/tokens';
import { MIN_INTENSITY, MAX_INTENSITY } from '@/lib/constants';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function IntensitySlider({ value, onChange }: Props) {
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

          return (
            <Pressable
              key={level}
              onPress={() => onChange(level)}
              style={[
                styles.segment,
                isActive && { backgroundColor: levelColor },
                isCurrent && { borderColor: levelColor, borderWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && { color: '#0A0E1A', fontWeight: '700' },
                ]}
              >
                {level}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.labels}>
        <Text style={styles.labelText}>낮음</Text>
        <Text style={styles.labelText}>높음</Text>
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
    flex: 1,
    height: 44,
    minWidth: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: {
    color: colors.text.tertiary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    color: colors.text.tertiary,
    fontSize: fontSize.xs,
  },
});
