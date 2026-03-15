export type SubscriptionTier = 'free' | 'pro';

export type GatedFeature =
  | 'mirror_unlimited'
  | 'full_archive'
  | 'search'
  | 'advanced_filters'
  | 'data_export'
  | 'stability_change'
  | 'reflection_save'
  | 'experiment_tracking'
  | 'weekly_ai_summary'
  | 'ai_pattern_analysis'
  | 'smart_experiments'
  | 'monthly_narrative';

const PRO_FEATURES: Set<GatedFeature> = new Set([
  'mirror_unlimited', 'full_archive', 'search', 'advanced_filters',
  'data_export', 'stability_change', 'reflection_save', 'experiment_tracking',
  'weekly_ai_summary', 'ai_pattern_analysis', 'smart_experiments', 'monthly_narrative',
]);

export function canUseFeature(tier: SubscriptionTier, feature: GatedFeature): boolean {
  if (tier === 'pro') return true;
  return !PRO_FEATURES.has(feature);
}

export const FREE_MIRROR_LIMIT = 3;
export const FREE_ARCHIVE_DAYS = 7;

export const PLANS = {
  monthly: { price: '₩5,900', period: '월', priceNum: 5900 },
  annual: { price: '₩49,900', period: '년', priceNum: 49900, savings: '30%' },
} as const;
