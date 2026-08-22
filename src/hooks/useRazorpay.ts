/**
 * SunoBolo — Razorpay Checkout Hook
 * 
 * Handles:
 * 1. Load Razorpay script
 * 2. Create order via backend API
 * 3. Open Razorpay checkout modal
 * 4. Verify payment via backend
 * 5. Activate subscription
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

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshAuth } = useAuth();

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const createOrder = useCallback(async (planId: string) => {
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ planId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create order');
    }

    return res.json();
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

  const checkout = useCallback(async (planId: string, planName: string, _amount: number) => {
    if (!user) {
      setError('Please login first');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Check your internet connection.');
      }

      // 2. Create order
      const orderData = await createOrder(planId);

      // 3. Open Razorpay checkout
      return new Promise<boolean>((resolve) => {
        const options: RazorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'SunoBolo English',
          description: `${planName} — One-time payment`,
          order_id: orderData.orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              // 4. Verify payment
              await verifyPayment(response, planId);
              
              // 5. Refresh auth to get updated subscription
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
            color: '#6366f1', // brand-600
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
      });
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setLoading(false);
      return false;
    }
  }, [user, loadRazorpayScript, createOrder, verifyPayment, refreshAuth]);

  return { checkout, loading, error };
}
