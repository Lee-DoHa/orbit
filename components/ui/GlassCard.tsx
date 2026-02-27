import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight';
};

export function GlassCard({ children, style, variant = 'default' }: Props) {
  return (
    <View
      style={[
        styles.card,
        variant === 'highlight' && styles.highlight,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
    padding: spacing.lg,
  },
  highlight: {
    borderColor: colors.accent.blue,
    backgroundColor: colors.accent.blueGlow,
  },
});
