import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize } from '@/theme/tokens';
import { CONTEXTS, type ContextId } from '@/lib/constants';

type Props = {
  selected: ContextId | null;
  onSelect: (id: ContextId) => void;
};

export function ContextTagSelector({ selected, onSelect }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {CONTEXTS.map((ctx) => {
        const isSelected = selected === ctx.id;
        return (
          <Pressable
            key={ctx.id}
            onPress={() => onSelect(ctx.id)}
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
  tag: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
