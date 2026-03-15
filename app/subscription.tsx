import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Alert, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/theme/tokens';
import { PLANS } from '@/lib/subscription';
import { useUserProfile } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { purchasePackage, restorePurchases, isRevenueCatConfigured } from '@/lib/revenueCat';

type PlanType = 'monthly' | 'annual';

function FeatureRow({ title, free, pro }: { title: string; free: boolean; pro: boolean }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureText}>{title}</Text>
      <View style={styles.featureChecks}>
        <View style={styles.featureCheckCell}>
          {free ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.accent.cyan} />
          ) : (
            <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
          )}
        </View>
        <View style={styles.featureCheckCell}>
          {pro ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.accent.blue} />
          ) : (
            <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
          )}
        </View>
      </View>
    </View>
  );
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const { data: user } = useUserProfile();
  const queryClient = useQueryClient();

  const isPro = user?.subscription_tier === 'pro';
  const isDev = __DEV__;

  async function handleSubscribe() {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        // Web: Stripe Checkout
        const { url } = await api.stripe.createCheckoutSession(selectedPlan);
        if (typeof window !== 'undefined') {
          window.location.href = url;
        } else {
          await Linking.openURL(url);
        }
      } else if (isRevenueCatConfigured()) {
        // Native: RevenueCat IAP
        const success = await purchasePackage(selectedPlan);
        if (success) {
          queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
          Alert.alert('구독 완료', 'Pro 플랜으로 전환되었습니다!');
        }
      } else {
        // Fallback: Demo toggle (dev mode or no payment configured)
        await api.users.updateSubscription('pro');
        queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        Alert.alert('구독 완료', 'Pro 플랜으로 전환되었습니다!');
      }
    } catch {
      Alert.alert('오류', '구독 전환에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      const success = await restorePurchases();
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        Alert.alert('복원 완료', '구독이 복원되었습니다!');
      } else {
        Alert.alert('복원 실패', '활성 구독을 찾을 수 없습니다.');
      }
    } catch {
      Alert.alert('오류', '구매 복원에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleDowngrade() {
    Alert.alert(
      'Free 플랜으로 전환',
      'Pro 기능(무제한 Mirror AI, 전체 기록, 고급 필터 등)을 더 이상 사용할 수 없게 됩니다.\n\n정말 Free 플랜으로 전환하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전환하기',
          style: 'destructive',
          onPress: async () => {
            try {
              if (Platform.OS === 'web') {
                // Web: Stripe portal
                const { url } = await api.stripe.getPortalSession();
                if (typeof window !== 'undefined') {
                  window.location.href = url;
                } else {
                  await Linking.openURL(url);
                }
              } else if (Platform.OS === 'ios') {
                // iOS: redirect to subscription management
                Linking.openURL('https://apps.apple.com/account/subscriptions');
              } else {
                // Android: redirect to Play Store subscriptions
                Linking.openURL('https://play.google.com/store/account/subscriptions');
              }
              // Also do demo toggle for dev
              if (isDev) {
                await api.users.updateSubscription('free');
                queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
                Alert.alert('전환 완료', 'Free 플랜으로 전환되었습니다.');
              }
            } catch {
              Alert.alert('오류', '플랜 전환에 실패했습니다.');
            }
          },
        },
      ]
    );
  }

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ORBIT Pro</Text>
          <Text style={styles.subtitle}>감정 분석의 깊이를 더하세요</Text>
        </View>

        {/* Already Pro */}
        {isPro ? (
          <GlassCard style={styles.proActiveCard} variant="highlight">
            <View style={styles.proActiveContent}>
              <Ionicons name="checkmark-circle" size={32} color={colors.accent.cyan} />
              <Text style={styles.proActiveText}>현재 Pro 플랜 사용 중</Text>
            </View>
            <Pressable style={styles.downgradeButton} onPress={handleDowngrade}>
              <Text style={styles.downgradeText}>Free 플랜으로 전환</Text>
            </Pressable>
          </GlassCard>
        ) : (
          <>
            {/* Plan Selection */}
            <View style={styles.planRow}>
              <Pressable
                style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={styles.planPeriod}>월간</Text>
                <Text style={styles.planPrice}>{PLANS.monthly.price}</Text>
                <Text style={styles.planPeriodSub}>/ {PLANS.monthly.period}</Text>
              </Pressable>

              <Pressable
                style={[styles.planCard, selectedPlan === 'annual' && styles.planCardSelected]}
                onPress={() => setSelectedPlan('annual')}
              >
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{PLANS.annual.savings} 절약</Text>
                </View>
                <Text style={styles.planPeriod}>연간</Text>
                <Text style={styles.planPrice}>{PLANS.annual.price}</Text>
                <Text style={styles.planPeriodSub}>/ {PLANS.annual.period}</Text>
              </Pressable>
            </View>

            {/* Subscribe Button */}
            <CosmicButton
              title={loading ? '처리 중...' : '구독하기'}
              onPress={handleSubscribe}
              style={styles.subscribeButton}
            />

            {/* Restore purchases (native only) */}
            {Platform.OS !== 'web' && (
              <Pressable style={styles.restoreButton} onPress={handleRestore}>
                <Text style={styles.restoreText}>구매 복원</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Feature Comparison */}
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonTitle}>기능 비교</Text>
          <View style={styles.comparisonLabels}>
            <Text style={styles.comparisonLabel}>Free</Text>
            <Text style={[styles.comparisonLabel, styles.comparisonLabelPro]}>Pro</Text>
          </View>
        </View>

        <GlassCard style={styles.featureList}>
          {/* Free features */}
          <FeatureRow title="감정 기록 무제한" free={true} pro={true} />
          <FeatureRow title="기본 주간 차트" free={true} pro={true} />
          <FeatureRow title="패턴 인식" free={true} pro={true} />
          <FeatureRow title="성장 단계" free={true} pro={true} />

          {/* Divider */}
          <View style={styles.featureDivider} />

          {/* Pro features */}
          <FeatureRow title="Mirror AI 무제한" free={false} pro={true} />
          <FeatureRow title="전체 기록 열람" free={false} pro={true} />
          <FeatureRow title="고급 필터/검색" free={false} pro={true} />
          <FeatureRow title="데이터 내보내기" free={false} pro={true} />
          <FeatureRow title="안정도 변화 추이" free={false} pro={true} />
          <FeatureRow title="월간 회고" free={false} pro={true} />

          {/* AI features divider */}
          <View style={styles.featureDivider} />

          {/* AI Pro features */}
          <FeatureRow title="AI 주간 요약" free={false} pro={true} />
          <FeatureRow title="AI 패턴 분석" free={false} pro={true} />
          <FeatureRow title="AI 맞춤 실험" free={false} pro={true} />
          <FeatureRow title="AI 월간 내러티브" free={false} pro={true} />
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.accent.blue,
    letterSpacing: 4,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  proActiveCard: {
    marginBottom: spacing.xl,
  },
  proActiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  proActiveText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.accent.cyan,
  },
  downgradeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignSelf: 'center',
  },
  downgradeText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  planRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.surface.glassBorder,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  planCardSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: colors.accent.blueGlow,
  },
  planPeriod: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  planPrice: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  planPeriodSub: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: -4,
    backgroundColor: colors.accent.cyan,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  savingsText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.inverse,
  },
  subscribeButton: {
    marginBottom: spacing.md,
  },
  restoreButton: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  restoreText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  comparisonTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  comparisonLabels: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  comparisonLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    width: 36,
    textAlign: 'center',
  },
  comparisonLabelPro: {
    color: colors.accent.blue,
  },
  featureList: {
    padding: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  featureText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.primary,
  },
  featureChecks: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  featureCheckCell: {
    width: 36,
    alignItems: 'center',
  },
  featureDivider: {
    height: 1,
    backgroundColor: colors.surface.glassBorder,
    marginVertical: spacing.sm,
  },
});
