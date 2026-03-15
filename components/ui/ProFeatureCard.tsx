import { View, Text, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/theme/tokens';

type Props = {
  icon?: string;
  title: string;
  description: string;
  style?: ViewStyle;
};

export function ProFeatureCard({ icon = 'lock-closed', title, description, style }: Props) {
  const router = useRouter();

  return (
    <View style={[styles.card, style]}>
      <View style={styles.lockBadge}>
        <Ionicons name="diamond" size={12} color={colors.accent.blue} />
        <Text style={styles.lockBadgeText}>Pro</Text>
      </View>
      <Ionicons name={icon as any} size={28} color={colors.text.tertiary} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable style={styles.button} onPress={() => router.push('/subscription')}>
        <Text style={styles.buttonText}>Pro 구독하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 158, 255, 0.15)',
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
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  lockBadgeText: {
    color: colors.accent.blue,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  icon: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.text.tertiary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: 'rgba(74, 158, 255, 0.12)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 158, 255, 0.25)',
  },
  buttonText: {
    color: colors.accent.blue,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
