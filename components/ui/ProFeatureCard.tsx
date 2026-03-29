import { View, Text, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize, fontWeight } from '@/theme/tokens';

type Props = {
  icon?: string;
  title: string;
  description: string;
  style?: ViewStyle;
};

export function ProFeatureCard({ icon = 'lock-closed', title, description, style }: Props) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.accent.blueSubtle,
          borderColor: colors.accent.blue + '30',
        },
        style,
      ]}
    >
      <View style={[styles.lockBadge, { backgroundColor: colors.accent.blueSubtle }]}>
        <Ionicons name="diamond" size={12} color={colors.accent.blue} />
        <Text style={[styles.lockBadgeText, { color: colors.accent.blue }]}>Pro</Text>
      </View>
      <Ionicons name={icon as any} size={28} color={colors.text.tertiary} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.text.tertiary }]}>{description}</Text>
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: colors.accent.blueSubtle,
            borderColor: colors.accent.blue + '40',
          },
        ]}
        onPress={() => router.push('/subscription')}
      >
        <Text style={[styles.buttonText, { color: colors.accent.blue }]}>Pro 구독하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  lockBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  icon: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
