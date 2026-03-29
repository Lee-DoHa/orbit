import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize } from '@/theme/tokens';
import { EMOTIONS, MAX_EMOTIONS, type EmotionId } from '@/lib/constants';

type Props = {
  selected: EmotionId[];
  onToggle: (id: EmotionId) => void;
};

export function EmotionChipGroup({ selected, onToggle }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {EMOTIONS.map((emotion) => {
        const isSelected = selected.includes(emotion.id);
        const isDisabled = !isSelected && selected.length >= MAX_EMOTIONS;
        const emotionColor = colors.emotion[emotion.name as keyof typeof colors.emotion];

        return (
          <Pressable
            key={emotion.id}
            onPress={() => {
              if (isDisabled) {
                Alert.alert('', '최대 3개까지 선택할 수 있어요');
                return;
              }
              onToggle(emotion.id);
            }}
            style={[
              styles.chip,
              {
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.cardBorder,
              },
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
                { color: colors.text.secondary },
                isSelected && { color: emotionColor },
                isDisabled && { color: colors.text.tertiary },
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
  },
});
