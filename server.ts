import express from 'express';
import { createServer as createViteServer } from 'vite';
import webpush from 'web-push';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// 1. Setup VAPID Keys for Web Push
const VAPID_FILE = path.resolve(__dirname, 'vapid-keys.json');
let vapidKeys: { publicKey: string; privateKey: string };

if (fs.existsSync(VAPID_FILE)) {
  try {
    vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf-8'));
  } catch {
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2));
  }
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2));
}

webpush.setVapidDetails(
  'mailto:suporte@aura-app.local',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 2. Subscriptions & Settings Database (Stored in subscriptions.json)
const SUBSCRIPTIONS_FILE = path.resolve(__dirname, 'subscriptions.json');

interface StoredSubscription {
  endpoint: string;
  subscription: webpush.PushSubscription;
  settings: {
    enabled: boolean;
    consistencyEnabled: boolean;
    consistencyTime1: string; // e.g. "08:30"
    consistencyTime2: string; // e.g. "20:30"
    affirmationsEnabled: boolean;
    affirmationIntervalHours: number; // 3
    affirmationsStartTime: string; // e.g. "09:00"
    affirmationsEndTime: string; // e.g. "00:00"
  };
  affirmations: string[];
  timezone: string;
  lastConsistencyTrigger?: string;
  lastConsistencyMsg?: string;
  lastAffirmationSentAt?: number;
  lastAffirmationText?: string;
}

let subscriptions: StoredSubscription[] = [];

function loadSubscriptions() {
  if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
    try {
      subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'));
    } catch {
      subscriptions = [];
    }
  }
}

function saveSubscriptions() {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
  } catch (err) {
    console.error('Error saving subscriptions:', err);
  }
}

loadSubscriptions();

// Consistency message pool
const CONSISTENCY_MESSAGES = [
  'Seu AURA está te esperando ✦ Hora de cuidar da sua melhor versão.',
  'Não quebra a sequência 👀 Já fez seu checklist hoje?',
  'Pequenas ações. Todos os dias. É assim que sua nova versão é construída.',
  'O seu futuro agradece cada hábito cumprido hoje ✦ Abra o AURA.',
  'Checklist diário em andamento? Cada passo conta rumo a dezembro!',
  'Constância supera a motivação. Venha registrar seu progresso no AURA ✦',
  'Fim do dia se aproximando: hora de fechar seus hábitos com chave de ouro ✨',
  'Reserve 5 minutos para você e sua evolução pessoal agora ✦',
  'Seu compromisso de hoje está de pé? A consistência é o seu maior superpoder.',
  'Hora de elevar sua energia! O AURA está aberto para o seu checklist ✦',
  'Lembre-se do motivo pelo qual começou. Seu Eu de Dezembro conta com você!',
  'Um dia de cada vez, um hábito de cada vez. Vamos em frente? ✦',
];

const DEFAULT_AFFIRMATIONS = [
  'Eu estou me tornando a minha melhor versão a cada dia.',
  'O universo conspira a favor da minha evolução e prosperidade.',
  'Minhas ações diárias estão construindo a realidade dos meus sonhos.',
  'Eu escolho a disciplina porque me amo e respeito meu futuro.',
  'A abundância flui com facilidade em minha vida.',
  'Minha energia é magnética, focada e imparável.',
  'Eu mereço viver com plenitude, saúde vibrante e sucesso.',
  'Estou em total alinhamento com os meus objetivos de 31 de dezembro.',
];

// Helper to send a push notification safely
async function sendPushToSubscription(
  sub: StoredSubscription,
  payload: { title: string; body: string; tag?: string; url?: string }
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      sub.subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: payload.tag || 'aura-notification',
        url: payload.url || '/',
      })
    );
    return true;
  } catch (err: unknown) {
    const error = err as { statusCode?: number };
    if (error.statusCode === 404 || error.statusCode === 410) {
      // Subscription has expired or is invalid
      subscriptions = subscriptions.filter((s) => s.endpoint !== sub.endpoint);
      saveSubscriptions();
    } else {
      console.warn('Push error for endpoint:', sub.endpoint, err);
    }
    return false;
  }
}

// 3. API Routes for Notifications

// Return VAPID Public Key for client subscription
app.get('/api/notifications/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Register or update subscription
app.post('/api/notifications/subscribe', (req, res) => {
  const { subscription, settings, affirmations, timezone } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Subscription missing or invalid' });
  }

  const existingIndex = subscriptions.findIndex((s) => s.endpoint === subscription.endpoint);
  const updatedEntry: StoredSubscription = {
    endpoint: subscription.endpoint,
    subscription,
    settings: settings || {
      enabled: true,
      consistencyEnabled: true,
      consistencyTime1: '08:30',
      consistencyTime2: '20:30',
      affirmationsEnabled: true,
      affirmationIntervalHours: 3,
      affirmationsStartTime: '09:00',
      affirmationsEndTime: '00:00',
    },
    affirmations: Array.isArray(affirmations) && affirmations.length > 0 ? affirmations : DEFAULT_AFFIRMATIONS,
    timezone: timezone || 'America/Sao_Paulo',
    lastConsistencyTrigger: existingIndex >= 0 ? subscriptions[existingIndex].lastConsistencyTrigger : undefined,
    lastConsistencyMsg: existingIndex >= 0 ? subscriptions[existingIndex].lastConsistencyMsg : undefined,
    lastAffirmationSentAt: existingIndex >= 0 ? subscriptions[existingIndex].lastAffirmationSentAt : undefined,
    lastAffirmationText: existingIndex >= 0 ? subscriptions[existingIndex].lastAffirmationText : undefined,
  };

  if (existingIndex >= 0) {
    subscriptions[existingIndex] = updatedEntry;
  } else {
    subscriptions.push(updatedEntry);
  }

  saveSubscriptions();
  res.json({ success: true, count: subscriptions.length });
});

// Sync updated settings or affirmations
app.post('/api/notifications/sync-settings', (req, res) => {
  const { endpoint, settings, affirmations, timezone } = req.body;

  if (endpoint) {
    const sub = subscriptions.find((s) => s.endpoint === endpoint);
    if (sub) {
      if (settings) sub.settings = { ...sub.settings, ...settings };
      if (Array.isArray(affirmations)) sub.affirmations = affirmations;
      if (timezone) sub.timezone = timezone;
      saveSubscriptions();
      return res.json({ success: true, updated: true });
    }
  }

  // If no matching endpoint or updating globally for local client
  for (const sub of subscriptions) {
    if (settings) sub.settings = { ...sub.settings, ...settings };
    if (Array.isArray(affirmations)) sub.affirmations = affirmations;
    if (timezone) sub.timezone = timezone;
  }
  saveSubscriptions();
  res.json({ success: true, updatedAll: true });
});

// Unsubscribe
app.post('/api/notifications/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (endpoint) {
    subscriptions = subscriptions.filter((s) => s.endpoint !== endpoint);
    saveSubscriptions();
  }
  res.json({ success: true });
});

// Test push notification immediately
app.post('/api/notifications/test', async (req, res) => {
  const { endpoint, type } = req.body;

  let targetSubs = subscriptions;
  if (endpoint) {
    targetSubs = subscriptions.filter((s) => s.endpoint === endpoint);
  }

  if (targetSubs.length === 0) {
    return res.status(400).json({ error: 'Nenhum dispositivo registrado ainda para teste.' });
  }

  let title = 'AURA ✦ Notificações Conectadas!';
  let body = 'Seu dispositivo está pronto para receber lembretes de constância e afirmações da Lei da Atração.';

  if (type === 'affirmation') {
    title = 'AURA ✦ Afirmação & Lei da Atração';
    body = '"Eu estou me tornando a minha melhor versão a cada dia e a cada escolha."';
  } else if (type === 'consistency') {
    title = 'AURA ✦ Constância Diária';
    body = 'Seu AURA está te esperando ✦ Hora de cuidar da sua melhor versão.';
  }

  let sentCount = 0;
  for (const sub of targetSubs) {
    const ok = await sendPushToSubscription(sub, {
      title,
      body,
      tag: 'aura-test-notification',
      url: '/',
    });
    if (ok) sentCount++;
  }

  res.json({ success: true, sentCount });
});

// Check status
app.get('/api/notifications/status', (req, res) => {
  res.json({
    activeSubscriptions: subscriptions.length,
    vapidKeyConfigured: !!vapidKeys.publicKey,
  });
});

// 4. Background Push Scheduler (Checks every 30 seconds)
function isTimeWithinActiveHours(currentTime: string, startTime: string, endTime: string): boolean {
  // times in format "HH:MM"
  if (startTime === endTime) return true;
  // If end is "00:00", treat as 24:00
  const normEnd = endTime === '00:00' ? '24:00' : endTime;

  if (normEnd > startTime) {
    return currentTime >= startTime && currentTime <= normEnd;
  } else {
    // Overnight period, e.g. 21:00 to 06:00
    return currentTime >= startTime || currentTime <= normEnd;
  }
}

function getRandomItemExcluding<T>(list: T[], excludedItem?: T): T {
  if (list.length === 0) return list[0];
  if (list.length === 1) return list[0];
  const filtered = list.filter((item) => item !== excludedItem);
  if (filtered.length === 0) return list[0];
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

setInterval(async () => {
  const now = new Date();

  for (const sub of subscriptions) {
    if (!sub.settings || !sub.settings.enabled) continue;

    const tz = sub.timezone || 'America/Sao_Paulo';
    let userTimeStr = '';
    let userDateStr = '';

    try {
      userTimeStr = now.toLocaleTimeString('pt-BR', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      userDateStr = now.toLocaleDateString('pt-BR', { timeZone: tz });
    } catch {
      userTimeStr = now.toISOString().substring(11, 16);
      userDateStr = now.toISOString().substring(0, 10);
    }

    // A. Consistency Notifications (2 times per day)
    if (sub.settings.consistencyEnabled) {
      const isTime1 = userTimeStr === sub.settings.consistencyTime1;
      const isTime2 = userTimeStr === sub.settings.consistencyTime2;

      if (isTime1 || isTime2) {
        const triggerKey = `${userDateStr}_${userTimeStr}`;
        if (sub.lastConsistencyTrigger !== triggerKey) {
          sub.lastConsistencyTrigger = triggerKey;
          const msg = getRandomItemExcluding(CONSISTENCY_MESSAGES, sub.lastConsistencyMsg);
          sub.lastConsistencyMsg = msg;
          saveSubscriptions();

          await sendPushToSubscription(sub, {
            title: 'AURA ✦ Constância Diária',
            body: msg,
            tag: `aura-consistency-${userTimeStr}`,
            url: '/',
          });
        }
      }
    }

    // B. Affirmation Notifications (every 3 hours during active hours)
    if (sub.settings.affirmationsEnabled) {
      const startTime = sub.settings.affirmationsStartTime || '09:00';
      const endTime = sub.settings.affirmationsEndTime || '00:00';
      const intervalHours = sub.settings.affirmationIntervalHours || 3;
      const intervalMs = intervalHours * 60 * 60 * 1000;

      const isInActivePeriod = isTimeWithinActiveHours(userTimeStr, startTime, endTime);

      if (isInActivePeriod) {
        const timeSinceLast = now.getTime() - (sub.lastAffirmationSentAt || 0);
        if (timeSinceLast >= intervalMs) {
          sub.lastAffirmationSentAt = now.getTime();
          const list = sub.affirmations && sub.affirmations.length > 0 ? sub.affirmations : DEFAULT_AFFIRMATIONS;
          const aff = getRandomItemExcluding(list, sub.lastAffirmationText);
          sub.lastAffirmationText = aff;
          saveSubscriptions();

          await sendPushToSubscription(sub, {
            title: 'AURA ✦ Afirmação & Lei da Atração',
            body: `"${aff}"`,
            tag: 'aura-affirmation',
            url: '/',
          });
        }
      }
    }
  }
}, 30000); // Check every 30 seconds

// 5. Mount Vite or static server
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AURA Server running at http://0.0.0.0:${PORT}`);
});
