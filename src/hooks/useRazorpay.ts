/**
 * SunoBolo — Razorpay Checkout Hook (with Coupon Support)
 * 
 * Handles:
 * 1. Load Razorpay script
 * 2. Validate coupon (optional)
 * 3. Create order via backend API (with discounted amount)
 * 4. Open Razorpay checkout modal
 * 5. Verify payment via backend
 * 6. Activate subscription
 */
import { useState, useCallback } from 'react';
import { useAuth } from '../lib/auth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name?: string;
    email?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CouponResult {
  valid: boolean;
  couponId?: string;
  couponCode?: string;
  discountType?: string;
  discountValue?: number;
  applicablePlans?: string;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
}

export interface OrderResult {
  orderId: string;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  currency: string;
  keyId: string;
  planId: string;
  demo?: boolean;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const { user, refreshAuth } = useAuth();

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const validateCoupon = useCallback(async (code: string, planId: string): Promise<CouponResult> => {
    setValidatingCoupon(true);
    setError(null);
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, planId }),
      });
      const data = await res.json();
      setValidatingCoupon(false);
      if (data.valid) {
        const result: CouponResult = { valid: true, ...data };
        setCouponResult(result);
        return result;
      } else {
        const result: CouponResult = { valid: false, error: data.error || 'Invalid coupon' };
        setCouponResult(null);
        return result;
      }
    } catch {
      setValidatingCoupon(false);
      const result: CouponResult = { valid: false, error: 'Network error validating coupon' };
      setCouponResult(null);
      return result;
    }
  }, []);

  const clearCoupon = useCallback(() => {
    setCouponResult(null);
    setError(null);
  }, []);

  const createOrder = useCallback(async (planId: string, couponCode?: string) => {
    const body: Record<string, string> = { planId };
    if (couponCode) body.couponCode = couponCode;

    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create order');
    }

    return res.json() as Promise<OrderResult>;
  }, []);

  const verifyPayment = useCallback(async (response: RazorpayResponse, planId: string) => {
    const res = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        planId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Payment verification failed');
    }

    return res.json();
  }, []);

  const checkout = useCallback(async (planId: string, planName: string, _amount: number, appliedCouponCode?: string) => {
    if (!user) {
      setError('Please login first');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Check your internet connection.');
      }

      // Create order (with coupon if applied — prefer explicit param over hook state)
      const orderData = await createOrder(planId, appliedCouponCode || couponResult?.couponCode || undefined);

      return new Promise<boolean>((resolve) => {
        const options: RazorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'SunoBolo English',
          description: `${planName} — One-time payment${orderData.discountAmount ? ` (₹${orderData.discountAmount / 100} off)` : ''}`,
          order_id: orderData.orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              await verifyPayment(response, planId);
              await refreshAuth();
              setLoading(false);
              resolve(true);
            } catch (err: any) {
              setError(err.message || 'Payment verification failed');
              setLoading(false);
              resolve(false);
            }
          },
          prefill: {
            name: user.name || '',
            email: user.email || '',
          },
          theme: {
            color: '#6366f1',
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              resolve(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          setError(response.error?.description || 'Payment failed');
          setLoading(false);
          resolve(false);
        });
        rzp.open();
        setError(null);
      });
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setLoading(false);
      return false;
    }
  }, [user, loadRazorpayScript, createOrder, verifyPayment, refreshAuth, couponResult]);

  return { checkout, loading, error, couponResult, validatingCoupon, validateCoupon, clearCoupon };
}
