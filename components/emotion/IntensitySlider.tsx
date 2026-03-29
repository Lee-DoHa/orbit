import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize } from '@/theme/tokens';
import { MIN_INTENSITY, MAX_INTENSITY } from '@/lib/constants';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

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

          return (
            <Pressable
              key={level}
              onPress={() => onChange(level)}
              style={[
                styles.segment,
                { backgroundColor: colors.surface.card },
                isActive && { backgroundColor: levelColor },
                isCurrent && { borderColor: levelColor, borderWidth: 2 },
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
    flex: 1,
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
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: fontSize.xs,
  },
});
