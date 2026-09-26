import { Habit, AreaGoal, Affirmation, VisionItem, DayRecord, NotificationSettings } from '../types';
import { INITIAL_AFFIRMATIONS, INITIAL_VISION_ITEMS, DEFAULT_NOTIFICATION_SETTINGS } from '../data/constants';
import { idbGet, idbSet } from './idb';

export const STORAGE_KEYS = {
  HABITS: 'aura_habits_v2',
  RECORDS: 'aura_day_records_v2',
  GOALS: 'aura_goals_v2',
  AFFIRMATIONS: 'aura_affirmations_v2',
  VISION_ITEMS: 'aura_vision_items_v2',
  SETTINGS: 'aura_notification_settings_v1',
  START_DATE: 'aura_challenge_start_date_v2',
};

// Request storage persistence from browser if available (prevent OS eviction on iOS/Android)
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        return await navigator.storage.persist();
      }
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// 1. Habits
export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading habits from localStorage', e);
  }
  return [];
}

export function saveHabits(habits: Habit[]): void {
  try {
    const serialized = JSON.stringify(habits);
    localStorage.setItem(STORAGE_KEYS.HABITS, serialized);
    idbSet(STORAGE_KEYS.HABITS, habits);
  } catch (e) {
    console.error('Error saving habits', e);
  }
}

// 2. Day Records (Checklists, notes, gratitude, practices)
export function loadDayRecords(): Record<string, DayRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('Error reading day records from localStorage', e);
  }
  return {};
}

export function saveDayRecords(records: Record<string, DayRecord>): void {
  try {
    const serialized = JSON.stringify(records);
    localStorage.setItem(STORAGE_KEYS.RECORDS, serialized);
    idbSet(STORAGE_KEYS.RECORDS, records);
  } catch (e) {
    console.error('Error saving day records', e);
  }
}

// 3. Goals
export function loadGoals(): AreaGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading goals from localStorage', e);
  }
  return [];
}

export function saveGoals(goals: AreaGoal[]): void {
  try {
    const serialized = JSON.stringify(goals);
    localStorage.setItem(STORAGE_KEYS.GOALS, serialized);
    idbSet(STORAGE_KEYS.GOALS, goals);
  } catch (e) {
    console.error('Error saving goals', e);
  }
}

// 4. Affirmations (keeps existing examples from Law of Attraction as requested)
export function loadAffirmations(): Affirmation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AFFIRMATIONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // First time init: preserve existing affirmations examples
    saveAffirmations(INITIAL_AFFIRMATIONS);
    return INITIAL_AFFIRMATIONS;
  } catch (e) {
    console.warn('Error reading affirmations from localStorage', e);
    return INITIAL_AFFIRMATIONS;
  }
}

export function saveAffirmations(affirmations: Affirmation[]): void {
  try {
    const serialized = JSON.stringify(affirmations);
    localStorage.setItem(STORAGE_KEYS.AFFIRMATIONS, serialized);
    idbSet(STORAGE_KEYS.AFFIRMATIONS, affirmations);
  } catch (e) {
    console.error('Error saving affirmations', e);
  }
}

// 5. Vision Board Items
export function loadVisionItems(): VisionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISION_ITEMS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    saveVisionItems(INITIAL_VISION_ITEMS);
    return INITIAL_VISION_ITEMS;
  } catch (e) {
    console.warn('Error reading vision items from localStorage', e);
    return INITIAL_VISION_ITEMS;
  }
}

export function saveVisionItems(items: VisionItem[]): void {
  try {
    const serialized = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEYS.VISION_ITEMS, serialized);
    idbSet(STORAGE_KEYS.VISION_ITEMS, items);
  } catch (e) {
    console.error('Error saving vision items', e);
  }
}

// 6. Notification Settings
export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_NOTIFICATION_SETTINGS };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    idbSet(STORAGE_KEYS.SETTINGS, settings);
  } catch {
    // ignore
  }
}

// 7. Challenge Start Date (Dynamic: starts whenever user begins, finishes Dec 31)
export function loadChallengeStartDate(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.START_DATE);
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveChallengeStartDate(dateStr: string | null): void {
  try {
    if (dateStr) {
      localStorage.setItem(STORAGE_KEYS.START_DATE, dateStr);
      idbSet(STORAGE_KEYS.START_DATE, dateStr);
    } else {
      localStorage.removeItem(STORAGE_KEYS.START_DATE);
      idbDel(STORAGE_KEYS.START_DATE);
    }
  } catch {
    // ignore
  }
}

// Background sync from IndexedDB if localStorage was cleared
export async function syncFromIndexedDBIfAvailable(): Promise<{
  recovered: boolean;
  habits?: Habit[];
  goals?: AreaGoal[];
  dayRecords?: Record<string, DayRecord>;
  affirmations?: Affirmation[];
  visionItems?: VisionItem[];
  settings?: NotificationSettings;
  challengeStartDate?: string | null;
}> {
  try {
    const habitsInLs = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (habitsInLs === null) {
      const idbHabits = await idbGet<Habit[]>(STORAGE_KEYS.HABITS);
      const idbGoals = await idbGet<AreaGoal[]>(STORAGE_KEYS.GOALS);
      const idbRecords = await idbGet<Record<string, DayRecord>>(STORAGE_KEYS.RECORDS);
      const idbAffirmations = await idbGet<Affirmation[]>(STORAGE_KEYS.AFFIRMATIONS);
      const idbVision = await idbGet<VisionItem[]>(STORAGE_KEYS.VISION_ITEMS);
      const idbSettings = await idbGet<NotificationSettings>(STORAGE_KEYS.SETTINGS);
      const idbStartDate = await idbGet<string>(STORAGE_KEYS.START_DATE);

      if (idbHabits || idbGoals || idbRecords || idbStartDate) {
        if (idbHabits) saveHabits(idbHabits);
        if (idbGoals) saveGoals(idbGoals);
        if (idbRecords) saveDayRecords(idbRecords);
        if (idbAffirmations) saveAffirmations(idbAffirmations);
        if (idbVision) saveVisionItems(idbVision);
        if (idbSettings) saveNotificationSettings(idbSettings);
        if (idbStartDate) saveChallengeStartDate(idbStartDate);

        return {
          recovered: true,
          habits: idbHabits,
          goals: idbGoals,
          dayRecords: idbRecords,
          affirmations: idbAffirmations,
          visionItems: idbVision,
          settings: idbSettings,
          challengeStartDate: idbStartDate,
        };
      }
    }
  } catch (err) {
    console.warn('Error during IDB recovery check:', err);
  }
  return { recovered: false };
}

// 8. Backup Export & Import with strict validation
export interface AuraBackupData {
  app: 'AURA';
  version: 2;
  exportedAt: string;
  data: {
    habits: Habit[];
    goals: AreaGoal[];
    dayRecords: Record<string, DayRecord>;
    affirmations: Affirmation[];
    visionItems: VisionItem[];
    notificationSettings?: NotificationSettings;
    challengeStartDate?: string | null;
  };
}

export function exportAppData(): string {
  const backup: AuraBackupData = {
    app: 'AURA',
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      habits: loadHabits(),
      goals: loadGoals(),
      dayRecords: loadDayRecords(),
      affirmations: loadAffirmations(),
      visionItems: loadVisionItems(),
      notificationSettings: loadNotificationSettings(),
      challengeStartDate: loadChallengeStartDate(),
    },
  };
  return JSON.stringify(backup, null, 2);
}

export interface ImportValidationResult {
  success: boolean;
  error?: string;
  summary?: {
    habitsCount: number;
    goalsCount: number;
    daysCount: number;
    affirmationsCount: number;
  };
  data?: AuraBackupData['data'];
}

export function validateAndParseBackup(jsonString: string): ImportValidationResult {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, error: 'O arquivo de backup está vazio ou ilegível.' };
    }

    const parsed = JSON.parse(jsonString);

    // Support both new wrapped format { app: 'AURA', data: {...} } and direct legacy format
    const dataCandidate = (parsed && parsed.data && typeof parsed.data === 'object') ? parsed.data : parsed;

    if (!dataCandidate || typeof dataCandidate !== 'object') {
      return { success: false, error: 'Estrutura do arquivo de backup inválida.' };
    }

    // Validate habits array
    const habits: Habit[] = Array.isArray(dataCandidate.habits)
      ? dataCandidate.habits.filter((h: any) => h && typeof h === 'object' && typeof h.id === 'string' && typeof h.title === 'string')
      : [];

    // Validate goals array
    const goals: AreaGoal[] = Array.isArray(dataCandidate.goals)
      ? dataCandidate.goals.filter((g: any) => g && typeof g === 'object' && typeof g.id === 'string' && typeof g.title === 'string')
      : [];

    // Validate dayRecords object
    const dayRecords: Record<string, DayRecord> = {};
    if (dataCandidate.dayRecords && typeof dataCandidate.dayRecords === 'object') {
      Object.entries(dataCandidate.dayRecords).forEach(([key, rec]: [string, any]) => {
        if (rec && typeof rec === 'object' && typeof rec.date === 'string') {
          dayRecords[key] = {
            date: rec.date,
            completedHabits: Array.isArray(rec.completedHabits) ? rec.completedHabits : [],
            note: typeof rec.note === 'string' ? rec.note : '',
            gratitude: typeof rec.gratitude === 'string' ? rec.gratitude : '',
            energyLevel: typeof rec.energyLevel === 'number' ? rec.energyLevel : undefined,
            practices: rec.practices && typeof rec.practices === 'object' ? rec.practices : undefined,
          };
        }
      });
    }

    // Validate affirmations array
    const affirmations: Affirmation[] = Array.isArray(dataCandidate.affirmations)
      ? dataCandidate.affirmations.filter((a: any) => a && typeof a === 'object' && typeof a.id === 'string' && typeof a.text === 'string')
      : [];

    // Validate vision items array
    const visionItems: VisionItem[] = Array.isArray(dataCandidate.visionItems)
      ? dataCandidate.visionItems.filter((v: any) => v && typeof v === 'object' && typeof v.id === 'string' && typeof v.title === 'string')
      : [];

    const notificationSettings: NotificationSettings =
      dataCandidate.notificationSettings && typeof dataCandidate.notificationSettings === 'object'
        ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...dataCandidate.notificationSettings }
        : DEFAULT_NOTIFICATION_SETTINGS;

    const challengeStartDate: string | null =
      typeof dataCandidate.challengeStartDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dataCandidate.challengeStartDate)
        ? dataCandidate.challengeStartDate
        : null;

    return {
      success: true,
      summary: {
        habitsCount: habits.length,
        goalsCount: goals.length,
        daysCount: Object.keys(dayRecords).length,
        affirmationsCount: affirmations.length,
      },
      data: {
        habits,
        goals,
        dayRecords,
        affirmations,
        visionItems,
        notificationSettings,
        challengeStartDate,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: 'Formato de arquivo JSON corrompido ou inválido.',
    };
  }
}

export function applyBackupData(data: AuraBackupData['data']): void {
  saveHabits(data.habits);
  saveGoals(data.goals);
  saveDayRecords(data.dayRecords);
  saveAffirmations(data.affirmations);
  saveVisionItems(data.visionItems);
  if (data.notificationSettings) {
    saveNotificationSettings(data.notificationSettings);
  }
  if (data.challengeStartDate !== undefined) {
    saveChallengeStartDate(data.challengeStartDate);
  }
}
