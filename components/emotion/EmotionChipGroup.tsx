import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '@/theme/tokens';
import { EMOTIONS, MAX_EMOTIONS, type EmotionId } from '@/lib/constants';

type Props = {
  selected: EmotionId[];
  onToggle: (id: EmotionId) => void;
};

export function EmotionChipGroup({ selected, onToggle }: Props) {
  return (
    <View style={styles.container}>
      {EMOTIONS.map((emotion) => {
        const isSelected = selected.includes(emotion.id);
        const isDisabled = !isSelected && selected.length >= MAX_EMOTIONS;
        const emotionColor = colors.emotion[emotion.name as keyof typeof colors.emotion];

        return (
          <Pressable
            key={emotion.id}
            onPress={() => !isDisabled && onToggle(emotion.id)}
            style={[
              styles.chip,
              isSelected && { backgroundColor: emotionColor + '25', borderColor: emotionColor },
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
                isSelected && { color: emotionColor },
                isDisabled && styles.labelDisabled,
              ]}
            >
              {emotion.name}
            </Text>
          </Pressable>
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
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
    gap: 6,
  },
  chipDisabled: {
    opacity: 0.3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  labelDisabled: {
    color: colors.text.tertiary,
  },
});
