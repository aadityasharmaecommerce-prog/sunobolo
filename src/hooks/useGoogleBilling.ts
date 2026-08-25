/**
 * SunoBolo — Google Play Billing Hook
 * 
 * Handles in-app purchases via Google Play Store.
 * Falls back to Razorpay on web platform.
 * 
 * Flow:
 * 1. Detect platform (Android vs Web)
 * 2. If Android + Play Store → Use Google Play Billing
 * 3. If Web → Use Razorpay (existing flow)
 * 4. Verify purchase on backend
 * 5. Activate subscription
 */

import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { useAuth } from '../lib/auth';

// Google Play product IDs (must match Play Console)
export const GOOGLE_PRODUCT_IDS = {
  one_month: 'sunobolo_one_month',
  three_month: 'sunobolo_three_month',
  six_month: 'sunobolo_six_month',
  one_year: 'sunobolo_one_year',
} as const;

export type GoogleProductId = keyof typeof GOOGLE_PRODUCT_IDS;

interface GoogleProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

interface BillingState {
  isAvailable: boolean;
  products: GoogleProduct[];
  loading: boolean;
  purchasing: boolean;
  error: string | null;
}

/**
 * Check if running in Capacitor (Android/iOS native)
 */
function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Check if running on Android specifically
 */
function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

export function useGoogleBilling() {
  const [state, setState] = useState<BillingState>({
    isAvailable: false,
    products: [],
    loading: false,
    purchasing: false,
    error: null,
  });

  const { user, refreshAuth } = useAuth();

  // Initialize billing on mount (Android only)
  useEffect(() => {
    if (!isAndroid()) {
      setState(s => ({ ...s, isAvailable: false }));
      return;
    }

    const initBilling = async () => {
      try {
        setState(s => ({ ...s, loading: true }));
        
        // Get product IDs
        const productIds = Object.values(GOOGLE_PRODUCT_IDS);
        
        // Fetch products from Google Play
        const { products } = await NativePurchases.getProducts({
          productIdentifiers: productIds,
          productType: PURCHASE_TYPE.INAPP, // One-time purchases
        });

        const formattedProducts: GoogleProduct[] = products.map(p => ({
          productId: p.identifier,
          title: p.title,
          description: p.description,
          price: p.priceString,
          priceAmount: p.price,
          currency: p.currencyCode,
        }));

        setState(s => ({
          ...s,
          isAvailable: true,
          products: formattedProducts,
          loading: false,
        }));

        // Listen for transaction updates (iOS only)
        await NativePurchases.addListener('transactionUpdated', (_transaction) => {
          // Transaction updated — iOS only
        });

        // Listen for verification failures (iOS only)
        await NativePurchases.addListener('transactionVerificationFailed', (event) => {
          setState(s => ({ ...s, error: event.error, purchasing: false }));
        });

      } catch (error: any) {
        console.error('[Billing] Init failed:', error);
        setState(s => ({
          ...s,
          isAvailable: false,
          loading: false,
          error: error.message || 'Billing not available',
        }));
      }
    };

    initBilling();

    return () => {
      // Clean up listeners
      NativePurchases.removeAllListeners();
    };
  }, []);

  /**
   * Purchase a product via Google Play
   */
  const purchase = useCallback(async (planId: GoogleProductId): Promise<boolean> => {
    if (!isAndroid()) {
      setState(s => ({ ...s, error: 'Google Play Billing only available on Android' }));
      return false;
    }

    if (!user) {
      setState(s => ({ ...s, error: 'Please login first' }));
      return false;
    }

    const productId = GOOGLE_PRODUCT_IDS[planId];
    if (!productId) {
      setState(s => ({ ...s, error: 'Invalid product ID' }));
      return false;
    }

    setState(s => ({ ...s, purchasing: true, error: null }));

    try {
      // Start purchase flow
      const transaction = await NativePurchases.purchaseProduct({
        productIdentifier: productId,
        productType: PURCHASE_TYPE.INAPP,
      });

      // Verify purchase on backend — backend is authoritative
      const verifyRes = await fetch('/api/payment/verify-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: transaction.productIdentifier,
          purchaseToken: transaction.purchaseToken,
        }),
      });

      const verifyData = await verifyRes.json();

      // Handle PENDING purchases
      if (verifyData.pending) {
        setState(s => ({ ...s, purchasing: false, error: 'Payment is pending. You will receive access once payment completes.' }));
        return false;
      }

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Purchase verification failed');
      }

      // Server-side acknowledgement is primary. Client-side is backup only.
      // Only acknowledge client-side if server didn't already
      if (transaction.purchaseToken && !verifyData.already_verified) {
        try {
          await NativePurchases.acknowledgePurchase({ purchaseToken: transaction.purchaseToken });
        } catch {
          // Server-side acknowledgement is primary — client failure is non-critical
        }
      }

      // Refresh auth to get updated subscription from server
      await refreshAuth();

      setState(s => ({ ...s, purchasing: false }));
      return true;

    } catch (error: any) {
      console.error('[Billing] Purchase failed:', error);
      setState(s => ({
        ...s,
        purchasing: false,
        error: error.message || 'Purchase failed',
      }));
      return false;
    }
  }, [user, refreshAuth]);

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isAndroid()) return false;

    try {
      setState(s => ({ ...s, loading: true }));

      // First restore on native side
      await NativePurchases.restorePurchases();

      // Then get all purchases
      const { purchases } = await NativePurchases.getPurchases({
        productType: PURCHASE_TYPE.INAPP,
      });

      if (purchases.length > 0) {
        // Verify restored purchases on backend
        for (const purchase of purchases) {
          // Only process completed purchases (purchaseState === "1")
          if (purchase.purchaseState !== '1') continue;

          if (purchase.purchaseToken) {
            await fetch('/api/payment/verify-google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                productId: purchase.productIdentifier,
                purchaseToken: purchase.purchaseToken,
              }),
            }).catch(() => {}); // Silent fail for restore — non-critical
          }
        }

        await refreshAuth();
      }

      setState(s => ({ ...s, loading: false }));
      return purchases.length > 0;

    } catch (error: any) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return false;
    }
  }, [refreshAuth]);

  /**
   * Get product info by plan ID
   */
  const getProduct = useCallback((planId: GoogleProductId): GoogleProduct | undefined => {
    const productId = GOOGLE_PRODUCT_IDS[planId];
    return state.products.find(p => p.productId === productId);
  }, [state.products]);

  return {
    ...state,
    purchase,
    restorePurchases,
    getProduct,
    isAndroid: isAndroid(),
    isNative: isNativePlatform(),
  };
}
