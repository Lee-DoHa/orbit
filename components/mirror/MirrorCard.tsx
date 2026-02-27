import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/theme/tokens';

type MirrorData = {
  understanding: string;
  structure: string;
  suggestion: string;
  question?: string | null;
};

type Props = {
  data: MirrorData;
};

function MirrorSection({
  number,
  title,
  content,
  accent,
}: {
  number: string;
  title: string;
  content: string;
  accent: string;
}) {
  return (
    <View style={sectionStyles.container}>
      <View style={[sectionStyles.badge, { backgroundColor: accent + '20' }]}>
        <Text style={[sectionStyles.badgeText, { color: accent }]}>{number}</Text>
      </View>
      <View style={sectionStyles.textArea}>
        <Text style={sectionStyles.title}>{title}</Text>
        <Text style={sectionStyles.content}>{content}</Text>
      </View>
    </View>
  );
}

export function MirrorCard({ data }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>오늘의 거울</Text>

      <MirrorSection
        number="1"
        title="이해"
        content={data.understanding}
        accent={colors.accent.cyan}
      />
      <MirrorSection
        number="2"
        title="구조"
        content={data.structure}
        accent={colors.accent.blue}
      />
      <MirrorSection
        number="3"
        title="제안"
        content={data.suggestion}
        accent={colors.accent.violet}
      />
      {data.question && (
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>성찰 질문</Text>
          <Text style={styles.questionText}>{data.question}</Text>
        </View>
      )}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textArea: {
    flex: 1,
  },
  title: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  content: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
    padding: spacing.lg,
  },
  header: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  questionBox: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surface.glassBorder,
  },
  questionLabel: {
    color: colors.accent.violet,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: 6,
  },
  questionText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
