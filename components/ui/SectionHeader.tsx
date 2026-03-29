import { Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, fontWeight, spacing, letterSpacing } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View
          style={[styles.accentDot, { backgroundColor: colors.accent.blue }]}
        />
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {title}
        </Text>
      </View>
      <View
        style={[styles.accentLine, { backgroundColor: colors.accent.blue }]}
      />
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.sm,
    opacity: 0.8,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider,
  },
  accentLine: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginTop: spacing.sm,
    marginLeft: 6 + spacing.sm, // align with text after dot
    opacity: 0.3,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    letterSpacing: letterSpacing.wide,
    lineHeight: 20,
  },
});
