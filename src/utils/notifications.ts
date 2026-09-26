import { NotificationSettings } from '../types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../data/constants';

const SETTINGS_KEY = 'aura_notification_settings_v1';
const SUBSCRIPTION_ENDPOINT_KEY = 'aura_push_endpoint';

// Convert URL-safe base64 string to Uint8Array for VAPID applicationServerKey
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export { loadNotificationSettings, saveNotificationSettings } from './storage';

// Register service worker if not already registered
export async function registerAuraServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.warn('Could not register Service Worker:', err);
    return null;
  }
}

// Subscribe to real device Push Notifications
export async function requestAndSubscribePush(
  settings: NotificationSettings,
  affirmationTexts: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return {
      success: false,
      error: 'Notificações push não são suportadas neste navegador.',
    };
  }

  try {
    // 1. Ask permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        error:
          permission === 'denied'
            ? 'Permissão de notificação negada nas configurações do seu navegador.'
            : 'Permissão não concedida.',
      };
    }

    // 2. Register Service Worker
    const registration = await registerAuraServiceWorker();
    if (!registration) {
      return { success: false, error: 'Falha ao registrar o Service Worker.' };
    }

    // Ensure it's ready
    await navigator.serviceWorker.ready;

    // 3. Fetch VAPID Public Key from server
    let publicKey = '';
    try {
      const res = await fetch('/api/notifications/vapid-public-key');
      const data = await res.json();
      publicKey = data.publicKey;
    } catch {
      // If server route not accessible, fallback
    }

    if (!publicKey) {
      return {
        success: false,
        error: 'Não foi possível obter a chave do servidor de push.',
      };
    }

    // 4. Create PushSubscription
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });
    }

    // 5. Send subscription to server
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        settings,
        affirmations: affirmationTexts,
        timezone: tz,
      }),
    });

    localStorage.setItem(SUBSCRIPTION_ENDPOINT_KEY, subscription.endpoint);
    return { success: true };
  } catch (err) {
    console.error('Error subscribing to push:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao ativar notificações.',
    };
  }
}

// Sync settings and affirmations with backend
export async function syncPushSettingsWithBackend(
  settings: NotificationSettings,
  affirmationTexts: string[]
): Promise<void> {
  if (!isPushSupported()) return;

  const endpoint = localStorage.getItem(SUBSCRIPTION_ENDPOINT_KEY) || undefined;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';

  try {
    await fetch('/api/notifications/sync-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        settings,
        affirmations: affirmationTexts,
        timezone: tz,
      }),
    });
  } catch (err) {
    console.warn('Could not sync push settings with backend:', err);
  }
}

// Trigger an immediate real test push notification to device
export async function triggerTestPush(
  type: 'general' | 'consistency' | 'affirmation' = 'general'
): Promise<{ success: boolean; message: string }> {
  const endpoint = localStorage.getItem(SUBSCRIPTION_ENDPOINT_KEY);

  try {
    const res = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, type }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        message: 'Notificação push enviada! Verifique a central de notificações do seu aparelho.',
      };
    } else {
      // If push failed, try local notification fallback if granted
      if (Notification.permission === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
          reg.showNotification('AURA ✦ Notificação Teste', {
            body:
              type === 'affirmation'
                ? '"Eu estou me tornando a minha melhor versão a cada dia."'
                : 'Seu AURA está te esperando ✦ Hora de cuidar da sua melhor versão.',
            icon: '/favicon.png',
            badge: '/favicon.png',
            tag: 'aura-test',
          });
          return {
            success: true,
            message: 'Notificação enviada ao seu dispositivo com sucesso!',
          };
        }
      }
      return {
        success: false,
        message: data.error || 'Erro ao enviar notificação de teste.',
      };
    }
  } catch {
    // Local fallback
    if (Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
          reg.showNotification('AURA ✦ Notificação Teste', {
            body: 'Seu AURA está te esperando ✦ Hora de cuidar da sua melhor versão.',
            icon: '/favicon.png',
            badge: '/favicon.png',
          });
          return {
            success: true,
            message: 'Notificação enviada ao seu dispositivo com sucesso!',
          };
        }
      } catch {
        // ignore
      }
    }
    return {
      success: false,
      message: 'Não foi possível conectar ao servidor de notificações.',
    };
  }
}
