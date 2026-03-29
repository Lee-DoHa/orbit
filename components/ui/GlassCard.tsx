import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight';
};

export function GlassCard({ children, style, variant = 'default' }: Props) {
  const { colors, isDark } = useTheme();

  const cardStyle: ViewStyle = isDark
    ? {
        backgroundColor: colors.surface.card,
        borderColor: colors.surface.cardBorder,
        borderWidth: 1,
      }
    : {
        backgroundColor: colors.surface.card,
        borderColor: colors.surface.cardBorder,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      };

  const highlightStyle: ViewStyle | null =
    variant === 'highlight'
      ? {
          borderColor: colors.accent.blue,
          backgroundColor: colors.accent.blueSubtle,
        }
      : null;

  return (
    <View style={[styles.card, cardStyle, highlightStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
});
