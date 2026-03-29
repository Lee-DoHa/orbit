import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, fontSize, fontWeight } from '@/theme/tokens';

type MirrorData = {
  understanding: string;
  structure: string;
  suggestion: string;
  question?: string | null;
};

type Props = {
  data: MirrorData;
  aiResponseId?: string;
  onFeedback?: (helpful: boolean) => void;
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

export function MirrorCard({ data, aiResponseId, onFeedback }: Props) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  function handleFeedback(helpful: boolean) {
    setFeedback(helpful ? 'up' : 'down');
    onFeedback?.(helpful);
  }

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

      <View style={styles.feedbackRow}>
        <Text style={styles.feedbackLabel}>이 분석이 도움이 되었나요?</Text>
        <View style={styles.feedbackButtons}>
          <Pressable
            style={[styles.feedbackBtn, feedback === 'up' && styles.feedbackBtnActive]}
            onPress={() => handleFeedback(true)}
            disabled={feedback !== null}
          >
            <Ionicons name={feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={feedback === 'up' ? colors.status.success : colors.text.secondary} />
          </Pressable>
          <Pressable
            style={[styles.feedbackBtn, feedback === 'down' && styles.feedbackBtnActiveNeg]}
            onPress={() => handleFeedback(false)}
            disabled={feedback !== null}
          >
            <Ionicons name={feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'} size={18} color={feedback === 'down' ? colors.status.error : colors.text.secondary} />
          </Pressable>
        </View>
      </View>
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
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surface.glassBorder,
  },
  feedbackLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface.glass,
  },
  feedbackBtnActive: {
    backgroundColor: colors.status.success + '1A',
  },
  feedbackBtnActiveNeg: {
    backgroundColor: colors.status.error + '1A',
  },
});
