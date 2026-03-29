import { Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
