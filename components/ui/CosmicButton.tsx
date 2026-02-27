import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/theme/tokens';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export function CosmicButton({ title, onPress, variant = 'primary', disabled = false, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'ghost' && styles.ghostText,
          disabled && styles.disabledText,
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
  primary: {
    backgroundColor: colors.accent.blue,
  },
  secondary: {
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: colors.surface.glass,
    opacity: 0.5,
  },
  text: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  ghostText: {
    color: colors.accent.blue,
  },
  disabledText: {
    color: colors.text.tertiary,
  },
});
