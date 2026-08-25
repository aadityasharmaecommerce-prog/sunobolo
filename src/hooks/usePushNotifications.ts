/**
 * SunoBolo — Push Notification Hook
 *
 * Key features:
 * 1. Checks and requests browser notification permission
 * 2. Creates PushManager subscription and syncs to backend
 * 3. syncToBackend() allows re-syncing after user login (handles pre-login permission grant)
 * 4. Module-level guard prevents multiple requestPermission() calls
 * 5. Checks Notification.permission directly as source of truth
 * 6. Separates browser permission from push subscription state
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface PushSubscriptionState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Module-level guard: prevent multiple concurrent requestPermission() calls.
 * This handles React StrictMode double-mount and rapid re-renders.
 */
let permissionRequestInProgress = false;

export function usePushNotifications() {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    loading: true,
    error: null,
  });

  const mountedRef = useRef(true);

  // Check support and current subscription on mount
  useEffect(() => {
    mountedRef.current = true;

    const checkStatus = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (mountedRef.current) {
          setState((s) => ({ ...s, isSupported: false, loading: false }));
        }
        return;
      }

      try {
        // Check if VAPID key is configured
        const res = await fetch('/api/push/vapid-key', { credentials: 'include' });
        const data = await res.json();
        if (!data.publicKey) {
          if (mountedRef.current) {
            setState((s) => ({ ...s, isSupported: false, loading: false }));
          }
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        // Read the ACTUAL browser permission — always the source of truth
        const permission = Notification.permission;

        if (mountedRef.current) {
          setState({
            isSupported: true,
            permission,
            isSubscribed: !!subscription,
            loading: false,
            error: null,
          });
        }

        // CRITICAL: If permission is granted but no subscription exists, create one.
        // This handles the case where user granted permission but the subscription
        // was never created (e.g., page reload, SW restart, etc.)
        if (permission === 'granted' && !subscription) {
          try {
            const applicationServerKey = urlBase64ToUint8Array(data.publicKey);
            const newSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
            });

            // Send to backend (requires auth — will fail silently for non-logged-in users)
            const { endpoint } = newSubscription;
            const p256dh = btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('p256dh')!)));
            const auth = btoa(String.fromCharCode(...new Uint8Array(newSubscription.getKey('auth')!)));

            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ endpoint, p256dh, auth }),
            }).catch(() => {});

            if (mountedRef.current) {
              setState((s) => ({ ...s, isSubscribed: true }));
            }
          } catch {
            // Subscription creation failed — user may have revoked permission
          }
        }
      } catch {
        if (mountedRef.current) {
          setState((s) => ({ ...s, isSupported: true, loading: false }));
        }
      }
    };

    checkStatus();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Sync existing browser subscription to backend.
   * Call this after user logs in to handle the case where:
   * - User granted notification permission before logging in
   * - Browser has a PushManager subscription
   * - Backend doesn't have it yet (401 prevented earlier save)
   */
  const syncToBackend = useCallback(async (): Promise<boolean> => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
      }

      const permission = Notification.permission;
      if (permission !== 'granted') return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return false;

      // Fetch VAPID key to verify backend is reachable
      const keyRes = await fetch('/api/push/vapid-key', { credentials: 'include' });
      const keyData = await keyRes.json();
      if (!keyData.publicKey) return false;

      // Send subscription to backend
      const { endpoint } = subscription;
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)));

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ endpoint, p256dh, auth }),
      });

      if (res.ok) {
        if (mountedRef.current) {
          setState((s) => ({ ...s, isSubscribed: true }));
        }
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported in this browser');
      }

      // Check current permission FIRST — do not request if already granted/denied
      let permission = Notification.permission;

      if (permission === 'granted') {
        // Permission already granted — skip requestPermission()
        // Just check if we need to create a subscription
      } else if (permission === 'denied') {
        // Permission denied — cannot request again
        setState((s) => ({ ...s, permission, loading: false, error: 'Notifications are blocked. Enable them in browser settings.' }));
        return false;
      } else {
        // permission === 'default' — need to request
        // Module-level guard: prevent concurrent requests
        if (permissionRequestInProgress) {
          setState((s) => ({ ...s, loading: false, error: 'Permission request already in progress' }));
          return false;
        }

        permissionRequestInProgress = true;
        try {
          permission = await Notification.requestPermission();
        } finally {
          permissionRequestInProgress = false;
        }

        // Update state immediately with the NEW permission value
        if (permission !== 'granted') {
          setState((s) => ({ ...s, permission, loading: false, error: 'Notification permission denied' }));
          return false;
        }
      }

      // If we reach here, permission is 'granted'
      // Fetch VAPID key
      const keyRes = await fetch('/api/push/vapid-key', { credentials: 'include' });
      const keyData = await keyRes.json();
      if (!keyData.publicKey) {
        throw new Error('Push notifications are not configured on the server');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check for existing subscription first — do not create duplicates
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      }

      // Send subscription to backend (idempotent — backend upserts)
      const { endpoint } = subscription;
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)));

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ endpoint, p256dh, auth }),
      });

      if (!res.ok) {
        throw new Error('Failed to save subscription on server');
      }

      // SUCCESS — update state with the ACTUAL browser permission
      setState({
        isSupported: true,
        permission: Notification.permission, // Read actual value after request
        isSubscribed: true,
        loading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      // On error, re-read the actual browser permission
      if (mountedRef.current) {
        setState((s) => ({
          ...s,
          permission: typeof Notification !== 'undefined' ? Notification.permission : s.permission,
          loading: false,
          error: err.message || 'Failed to subscribe',
        }));
      }
      return false;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => {});
      }

      setState({
        isSupported: true,
        permission: Notification.permission,
        isSubscribed: false,
        loading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.message || 'Failed to unsubscribe',
      }));
      return false;
    }
  }, []);

  // Toggle subscription
  const toggle = useCallback(async () => {
    if (state.isSubscribed) {
      return unsubscribe();
    }
    return subscribe();
  }, [state.isSubscribed, subscribe, unsubscribe]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    toggle,
    syncToBackend,
  };
}
