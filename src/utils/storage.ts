import { Habit, AreaGoal, Affirmation, VisionItem, DayRecord } from '../types';
import { INITIAL_HABITS, INITIAL_GOALS, INITIAL_AFFIRMATIONS, INITIAL_VISION_ITEMS } from '../data/constants';
import { getTodayDateString, parseDate } from './dates';

const STORAGE_KEYS = {
  HABITS: 'vertex_habits_v1',
  RECORDS: 'vertex_day_records_v1',
  GOALS: 'vertex_goals_v1',
  AFFIRMATIONS: 'vertex_affirmations_v1',
  VISION_ITEMS: 'vertex_vision_items_v1',
  HAS_INITIALIZED: 'vertex_initialized_v1',
};

// Generates realistic past completion history for the last 14 days so the app feels alive on first open
function generateInitialHistoricalRecords(): Record<string, DayRecord> {
  const todayStr = getTodayDateString();
  const today = parseDate(todayStr);
  const records: Record<string, DayRecord> = {};

  const sampleNotes = [
    'Sensação maravilhosa de disciplina. Treino rendeu muito.',
    'Dia de foco intenso no trabalho. Alimentação 100% limpa.',
    'Energia muito elevada hoje. Senti a conexão com os meus objetivos de dezembro.',
    'Leitura profunda hoje sobre mentalidade. Durmo com paz no coração.',
    'Dia produtivo. Prática de visualização matinal foi muito clara e viva.',
    'Corpo respondendo bem à nova rotina. Menos cansaço à tarde.',
    'Orgulho da constância. Pequenas vitórias diárias somam grande transformação.',
  ];

  for (let i = 12; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;

    // Pick 8 to 11 habits completed on past days
    const completedCount = 8 + (i % 4);
    const completed = INITIAL_HABITS.slice(0, Math.min(completedCount, INITIAL_HABITS.length)).map(h => h.id);

    records[dateKey] = {
      date: dateKey,
      completedHabits: completed,
      note: sampleNotes[i % sampleNotes.length],
      gratitude: 'Grato(a) pela minha saúde, foco inabalável e pelo caminho que estou construindo.',
      energyLevel: 4 + (i % 2),
      practices: {
        visualization: true,
        gratitude: true,
        affirmation: true,
        futureSelfAction: i % 2 === 0,
        nightScripting: i % 3 === 0,
      },
    };
  }

  // Today initial record with 4 habits already checked to prompt completion
  records[todayStr] = {
    date: todayStr,
    completedHabits: ['h1', 'h2', 'h3', 'h11'],
    note: '',
    gratitude: 'Grato(a) pela oportunidade de mais um dia rumo à minha melhor versão.',
    energyLevel: 5,
    practices: {
      visualization: true,
      gratitude: true,
      affirmation: true,
      futureSelfAction: false,
      nightScripting: false,
    },
  };

  return records;
}

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      saveHabits(INITIAL_HABITS);
      return INITIAL_HABITS;
    }
    const parsed: Habit[] = JSON.parse(raw);
    const existingIds = new Set(parsed.map((h) => h.id));
    let hasNew = false;
    const merged = [...parsed];
    INITIAL_HABITS.forEach((h) => {
      if (!existingIds.has(h.id)) {
        merged.push(h);
        hasNew = true;
      }
    });
    if (hasNew) {
      saveHabits(merged);
    }
    return merged;
  } catch {
    return INITIAL_HABITS;
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits', e);
  }
}

export function loadDayRecords(): Record<string, DayRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      const initialHistory = generateInitialHistoricalRecords();
      saveDayRecords(initialHistory);
      return initialHistory;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveDayRecords(records: Record<string, DayRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving day records', e);
  }
}

export function loadGoals(): AreaGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) {
      saveGoals(INITIAL_GOALS);
      return INITIAL_GOALS;
    }
    const parsed: AreaGoal[] = JSON.parse(raw);
    // Ensure any newly introduced areas in INITIAL_GOALS (like financas, glow_up) are merged if missing
    const existingAreaIds = new Set(parsed.map((g) => g.areaId));
    let hasNew = false;
    const merged = [...parsed];
    INITIAL_GOALS.forEach((initGoal) => {
      if (!existingAreaIds.has(initGoal.areaId)) {
        merged.push(initGoal);
        hasNew = true;
      }
    });
    if (hasNew) {
      saveGoals(merged);
    }
    return merged;
  } catch {
    return INITIAL_GOALS;
  }
}

export function saveGoals(goals: AreaGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving goals', e);
  }
}

export function loadAffirmations(): Affirmation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AFFIRMATIONS);
    if (!raw) {
      saveAffirmations(INITIAL_AFFIRMATIONS);
      return INITIAL_AFFIRMATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AFFIRMATIONS;
  }
}

export function saveAffirmations(affirmations: Affirmation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AFFIRMATIONS, JSON.stringify(affirmations));
  } catch (e) {
    console.error('Error saving affirmations', e);
  }
}

export function loadVisionItems(): VisionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISION_ITEMS);
    if (!raw) {
      saveVisionItems(INITIAL_VISION_ITEMS);
      return INITIAL_VISION_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_VISION_ITEMS;
  }
}

export function saveVisionItems(items: VisionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VISION_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving vision items', e);
  }
}

export function exportAppData(): string {
  const data = {
    habits: loadHabits(),
    dayRecords: loadDayRecords(),
    goals: loadGoals(),
    affirmations: loadAffirmations(),
    visionItems: loadVisionItems(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAppData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.habits) saveHabits(parsed.habits);
    if (parsed.dayRecords) saveDayRecords(parsed.dayRecords);
    if (parsed.goals) saveGoals(parsed.goals);
    if (parsed.affirmations) saveAffirmations(parsed.affirmations);
    if (parsed.visionItems) saveVisionItems(parsed.visionItems);
    return true;
  } catch (e) {
    console.error('Failed to import app data', e);
    return false;
  }
}

export function resetAppToDefaults(): void {
  localStorage.removeItem(STORAGE_KEYS.HABITS);
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
  localStorage.removeItem(STORAGE_KEYS.GOALS);
  localStorage.removeItem(STORAGE_KEYS.AFFIRMATIONS);
  localStorage.removeItem(STORAGE_KEYS.VISION_ITEMS);
  window.location.reload();
}
