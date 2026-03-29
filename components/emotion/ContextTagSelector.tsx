import { View, Text, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { useRef, useCallback } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize, letterSpacing, animation } from '@/theme/tokens';
import { CONTEXTS, type ContextId } from '@/lib/constants';

type Props = {
  selected: ContextId | null;
  onSelect: (id: ContextId) => void;
};

function ContextTag({
  ctx,
  isSelected,
  onPress,
}: {
  ctx: (typeof CONTEXTS)[number];
  isSelected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.93,
        duration: animation.duration.fast,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        speed: 18,
        bounciness: 6,
      }),
    ]).start();
    onPress();
  }, [onPress, scaleAnim]);

  const selectedShadow = isSelected
    ? {
        shadowColor: colors.accent.violet,
        shadowOffset: { width: 0, height: 0 } as const,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      }
    : {};

  const webGlow =
    isSelected && Platform.OS === 'web'
      ? { boxShadow: `0 0 10px 1px ${colors.glow.violet}` }
      : {};

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.tag,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.cardBorder,
          },
          isSelected && {
            backgroundColor: colors.accent.violet + '18',
            borderColor: colors.accent.violet,
          },
          isSelected && selectedShadow,
          isSelected && (webGlow as any),
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: colors.text.secondary },
            isSelected && { color: colors.accent.violet },
          ]}
        >
          {ctx.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ContextTagSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {CONTEXTS.map((ctx) => (
        <ContextTag
          key={ctx.id}
          ctx={ctx}
          isSelected={selected === ctx.id}
          onPress={() => onSelect(ctx.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    letterSpacing: letterSpacing.wide,
  },
});
