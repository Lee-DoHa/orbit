import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize, fontWeight } from '@/theme/tokens';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export function CosmicButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: Props) {
  const { colors, isDark } = useTheme();

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.accent.blue,
    },
    secondary: {
      backgroundColor: isDark ? colors.surface.card : colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.surface.cardBorder,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const textColor =
    variant === 'ghost'
      ? colors.accent.blue
      : variant === 'primary'
        ? '#FFFFFF'
        : colors.text.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        disabled && { backgroundColor: colors.surface.card, opacity: 0.5 },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
          disabled && { color: colors.text.tertiary },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
