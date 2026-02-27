import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '@/theme/tokens';
import { CONTEXTS, type ContextId } from '@/lib/constants';

type Props = {
  selected: ContextId | null;
  onSelect: (id: ContextId) => void;
};

export function ContextTagSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {CONTEXTS.map((ctx) => {
        const isSelected = selected === ctx.id;
        return (
          <Pressable
            key={ctx.id}
            onPress={() => onSelect(ctx.id)}
            style={[styles.tag, isSelected && styles.tagSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
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
    paddingHorizontal: 18,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
  },
  tagSelected: {
    backgroundColor: colors.accent.violetGlow,
    borderColor: colors.accent.violet,
  },
  label: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.accent.violet,
  },
});
