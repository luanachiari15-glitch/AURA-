export type LifeAreaId =
  | 'exercicio'
  | 'alimentacao'
  | 'trabalho'
  | 'autocuidado'
  | 'hobbies'
  | 'desenvolvimento'
  | 'lei_da_atracao'
  | 'financas'
  | 'glow_up';

export interface LifeArea {
  id: LifeAreaId;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgLight: string;
  borderLight: string;
  description: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  areaId: LifeAreaId;
  frequency: 'daily' | 'weekdays' | 'weekends' | '3x_week' | '2x_week' | 'custom';
  targetDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
  createdAt: string;
  streak?: number;
}

export interface LawOfAttractionPractices {
  visualization: boolean;
  gratitude: boolean;
  affirmation: boolean;
  futureSelfAction: boolean;
  nightScripting: boolean;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  completedHabits: string[]; // Habit IDs
  note?: string;
  gratitude?: string;
  energyLevel?: number; // 1 to 5
  practices?: LawOfAttractionPractices;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface AreaGoal {
  id: string;
  areaId: LifeAreaId;
  title: string;
  targetDescription: string;
  completed: boolean;
  deadline: string; // e.g. "31 de Dezembro"
  milestones: GoalMilestone[];
}

export interface Affirmation {
  id: string;
  text: string;
  areaId?: LifeAreaId;
  isCustom?: boolean;
}

export interface VisionItem {
  id: string;
  title: string;
  statement: string; // "Em dezembro de 2026, eu..."
  feeling: string; // "Sensação de liberdade e abundância"
  areaId: LifeAreaId;
}

export interface ChallengeConfig {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (typically 2026-12-31)
  name: string;
  commitmentStatement: string;
}

export interface NotificationSettings {
  enabled: boolean;
  consistencyEnabled: boolean;
  consistencyTime1: string; // e.g. "08:30"
  consistencyTime2: string; // e.g. "20:30"
  affirmationsEnabled: boolean;
  affirmationIntervalHours: number; // 3
  affirmationsStartTime: string; // e.g. "09:00"
  affirmationsEndTime: string; // e.g. "00:00"
  lastConsistencyIndex?: number;
  lastAffirmationText?: string;
  lastAffirmationSentAt?: number;
}

