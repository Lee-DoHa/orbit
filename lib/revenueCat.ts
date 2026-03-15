import { Platform } from 'react-native';

// RevenueCat SDK wrapper
// In production, install react-native-purchases and use real SDK
// For now, this is a mock wrapper that prepares the interface

const RC_IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY || '';
const RC_ANDROID_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY || '';

let isConfigured = false;

export async function initRevenueCat(userId?: string): Promise<void> {
  const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;

  if (!apiKey) {
    console.log('[RevenueCat] No API key configured, running in mock mode');
    return;
  }

  try {
    // In production with react-native-purchases installed:
    // const Purchases = require('react-native-purchases').default;
    // Purchases.configure({ apiKey });
    // if (userId) await Purchases.logIn(userId);
    isConfigured = true;
    console.log('[RevenueCat] Configured successfully');
  } catch (err) {
    console.error('[RevenueCat] Configuration failed:', err);
  }
}

export async function purchasePackage(plan: 'monthly' | 'annual'): Promise<boolean> {
  if (!isConfigured) {
    console.log('[RevenueCat] Mock purchase:', plan);
    return false; // Mock mode - caller should handle
  }

  try {
    // In production:
    // const Purchases = require('react-native-purchases').default;
    // const offerings = await Purchases.getOfferings();
    // const pkg = plan === 'annual'
    //   ? offerings.current?.annual
    //   : offerings.current?.monthly;
    // if (!pkg) throw new Error('Package not found');
    // const { customerInfo } = await Purchases.purchasePackage(pkg);
    // return customerInfo.entitlements.active['pro'] !== undefined;
    return false;
  } catch (err: any) {
    if (err.userCancelled) return false;
    throw err;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!isConfigured) {
    console.log('[RevenueCat] Mock restore');
    return false;
  }

  try {
    // In production:
    // const Purchases = require('react-native-purchases').default;
    // const customerInfo = await Purchases.restorePurchases();
    // return customerInfo.entitlements.active['pro'] !== undefined;
    return false;
  } catch (err) {
    console.error('[RevenueCat] Restore failed:', err);
    throw err;
  }
}

export async function getCustomerInfo(): Promise<{ isPro: boolean; expiresAt: string | null }> {
  if (!isConfigured) {
    return { isPro: false, expiresAt: null };
  }

  try {
    // In production:
    // const Purchases = require('react-native-purchases').default;
    // const customerInfo = await Purchases.getCustomerInfo();
    // const proEntitlement = customerInfo.entitlements.active['pro'];
    // return {
    //   isPro: !!proEntitlement,
    //   expiresAt: proEntitlement?.expirationDate || null,
    // };
    return { isPro: false, expiresAt: null };
  } catch (err) {
    console.error('[RevenueCat] getCustomerInfo failed:', err);
    return { isPro: false, expiresAt: null };
  }
}

export function isRevenueCatConfigured(): boolean {
  return isConfigured;
}
