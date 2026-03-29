import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, fontSize, fontWeight } from '@/theme/tokens';

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
  const { colors } = useTheme();

  return (
    <View style={sectionStyles.container}>
      <View style={[sectionStyles.badge, { backgroundColor: accent + '20' }]}>
        <Text style={[sectionStyles.badgeText, { color: accent }]}>{number}</Text>
      </View>
      <View style={sectionStyles.textArea}>
        <Text style={[sectionStyles.title, { color: colors.text.secondary }]}>{title}</Text>
        <Text style={[sectionStyles.content, { color: colors.text.primary }]}>{content}</Text>
      </View>
    </View>
  );
}

export function MirrorCard({ data, aiResponseId, onFeedback }: Props) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const { colors } = useTheme();

  function handleFeedback(helpful: boolean) {
    setFeedback(helpful ? 'up' : 'down');
    onFeedback?.(helpful);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface.card,
          borderColor: colors.surface.cardBorder,
        },
      ]}
    >
      <Text style={[styles.header, { color: colors.text.primary }]}>오늘의 거울</Text>

      <MirrorSection number="1" title="이해" content={data.understanding} accent={colors.accent.cyan} />
      <MirrorSection number="2" title="구조" content={data.structure} accent={colors.accent.blue} />
      <MirrorSection number="3" title="제안" content={data.suggestion} accent={colors.accent.violet} />

      {data.question && (
        <View style={[styles.questionBox, { borderTopColor: colors.surface.cardBorder }]}>
          <Text style={[styles.questionLabel, { color: colors.accent.violet }]}>성찰 질문</Text>
          <Text style={[styles.questionText, { color: colors.text.secondary }]}>{data.question}</Text>
        </View>
      )}

      <View style={[styles.feedbackRow, { borderTopColor: colors.surface.cardBorder }]}>
        <Text style={[styles.feedbackLabel, { color: colors.text.secondary }]}>이 분석이 도움이 되었나요?</Text>
        <View style={styles.feedbackButtons}>
          <Pressable
            style={[
              styles.feedbackBtn,
              { backgroundColor: colors.surface.card },
              feedback === 'up' && { backgroundColor: colors.status.success + '1A' },
            ]}
            onPress={() => handleFeedback(true)}
            disabled={feedback !== null}
          >
            <Ionicons
              name={feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
              size={18}
              color={feedback === 'up' ? colors.status.success : colors.text.secondary}
            />
          </Pressable>
          <Pressable
            style={[
              styles.feedbackBtn,
              { backgroundColor: colors.surface.card },
              feedback === 'down' && { backgroundColor: colors.status.error + '1A' },
            ]}
            onPress={() => handleFeedback(false)}
            disabled={feedback !== null}
          >
            <Ionicons
              name={feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
              size={18}
              color={feedback === 'down' ? colors.status.error : colors.text.secondary}
            />
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
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  content: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  questionBox: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  questionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: 6,
  },
  questionText: {
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
  },
  feedbackLabel: {
    fontSize: fontSize.xs,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackBtn: {
    padding: 8,
    borderRadius: 8,
  },
});
