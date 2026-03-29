import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  View,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useRef, useCallback } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize, fontWeight, letterSpacing } from '@/theme/tokens';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  }, [scaleAnim]);

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.accent.blue,
      ...(Platform.OS === 'web'
        ? ({
            backgroundImage: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 50%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 50%)',
          } as any)
        : {}),
    },
    secondary: {
      backgroundColor: isDark ? colors.surface.card : 'transparent',
      borderWidth: 1.5,
      borderColor: isDark
        ? 'rgba(99, 102, 241, 0.30)'
        : 'rgba(79, 70, 229, 0.25)',
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

  const disabledStyle: ViewStyle | undefined = disabled
    ? {
        backgroundColor:
          variant === 'ghost' ? 'transparent' : isDark ? 'rgba(255,255,255,0.04)' : '#E9E8E3',
        borderColor: 'transparent',
        opacity: 0.55,
      }
    : undefined;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.base,
          variantStyles[variant],
          disabledStyle,
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: textColor },
            variant === 'ghost' && styles.ghostText,
            disabled && { color: isDark ? '#5E6380' : '#9191A8' },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
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
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wide,
  },
  ghostText: {
    fontWeight: fontWeight.medium,
  },
});
