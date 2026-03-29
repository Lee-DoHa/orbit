import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, shadow } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight';
  elevated?: boolean;
};

export function GlassCard({
  children,
  style,
  variant = 'default',
  elevated = false,
}: Props) {
  const { colors, isDark } = useTheme();

  const baseStyle: ViewStyle = isDark
    ? {
        backgroundColor: elevated
          ? colors.surface.elevated
          : colors.surface.card,
        borderColor: colors.surface.cardBorder,
        borderWidth: 1,
        ...(Platform.OS === 'web'
          ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
          : {}),
      }
    : {
        backgroundColor: colors.surface.card,
        borderColor: colors.surface.cardBorder,
        borderWidth: 1,
        ...(elevated ? shadow.light.md : shadow.light.sm),
      };

  const highlightStyle: ViewStyle | null =
    variant === 'highlight'
      ? isDark
        ? {
            borderColor: 'rgba(99, 102, 241, 0.35)',
            backgroundColor: colors.accent.blueSubtle,
            ...(Platform.OS === 'web'
              ? ({
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
                } as any)
              : {}),
          }
        : {
            borderColor: 'rgba(79, 70, 229, 0.25)',
            backgroundColor: colors.accent.blueSubtle,
            ...shadow.light.md,
          }
      : null;

  return (
    <View style={[styles.card, baseStyle, highlightStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
  },
});
