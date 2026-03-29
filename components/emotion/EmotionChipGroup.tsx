import { View, Text, Pressable, StyleSheet, Alert, Platform, Animated } from 'react-native';
import { useRef, useCallback } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize, letterSpacing } from '@/theme/tokens';
import { EMOTIONS, MAX_EMOTIONS, type EmotionId } from '@/lib/constants';

type Props = {
  selected: EmotionId[];
  onToggle: (id: EmotionId) => void;
};

function EmotionChip({
  emotion,
  isSelected,
  isDisabled,
  emotionColor,
  onPress,
}: {
  emotion: (typeof EMOTIONS)[number];
  isSelected: boolean;
  isDisabled: boolean;
  emotionColor: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    if (isDisabled) {
      Alert.alert('', '최대 3개까지 선택할 수 있어요');
      return;
    }
    // Subtle spring scale on toggle
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: Platform.OS !== 'web',
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        speed: 14,
        bounciness: 6,
      }),
    ]).start();
    onPress();
  }, [isDisabled, onPress, scaleAnim]);

  const glowShadow = isSelected
    ? {
        shadowColor: emotionColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 4,
      }
    : {};

  const webGlow =
    isSelected && Platform.OS === 'web'
      ? { boxShadow: `0 0 14px 2px ${emotionColor}40` }
      : {};

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.chip,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.cardBorder,
          },
          isSelected && {
            backgroundColor: emotionColor + '25',
            borderColor: emotionColor,
          },
          isSelected && glowShadow,
          isSelected && (webGlow as any),
          isDisabled && styles.chipDisabled,
        ]}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: isSelected ? emotionColor : colors.text.tertiary },
          ]}
        />
        <Text
          style={[
            styles.label,
            { color: colors.text.secondary },
            isSelected && { color: emotionColor },
            isDisabled && { color: colors.text.tertiary },
          ]}
        >
          {emotion.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function EmotionChipGroup({ selected, onToggle }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {EMOTIONS.map((emotion) => {
        const isSelected = selected.includes(emotion.id);
        const isDisabled = !isSelected && selected.length >= MAX_EMOTIONS;
        const emotionColor = colors.emotion[emotion.name as keyof typeof colors.emotion];

        return (
          <EmotionChip
            key={emotion.id}
            emotion={emotion}
            isSelected={isSelected}
            isDisabled={isDisabled}
            emotionColor={emotionColor}
            onPress={() => onToggle(emotion.id)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 6,
    flexShrink: 0,
  },
  chipDisabled: {
    opacity: 0.3,
  },
  dot: {
    width: 8,
    height: 8,
    minWidth: 8,
    minHeight: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    letterSpacing: letterSpacing.wide,
  },
});
