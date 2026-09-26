export const CHALLENGE_END_DATE = '2026-12-31';
export const CHALLENGE_START_DATE = '2026-09-28';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateToPtBr(dateStr: string): string {
  const date = parseDate(dateStr);
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekday = weekdays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${weekday}, ${day} de ${month}`;
}

export function formatShortDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function getDayOfWeekAbbr(dateStr: string): string {
  const date = parseDate(dateStr);
  const abbrs = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  return abbrs[date.getDay()];
}

export function getDaysRemainingUntilDec31(currentDateStr: string = getTodayDateString()): {
  daysRemaining: number;
  totalChallengeDays: number;
  dayNumber: number;
  percentProgress: number;
  isStarted: boolean;
  daysUntilStart: number;
} {
  const current = parseDate(currentDateStr);
  const start = parseDate(CHALLENGE_START_DATE);
  const end = parseDate(CHALLENGE_END_DATE);

  const msPerDay = 1000 * 60 * 60 * 24;
  
  const totalChallengeDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay) + 1);
  const daysRemaining = Math.max(0, Math.round((end.getTime() - current.getTime()) / msPerDay));
  
  const isStarted = current.getTime() >= start.getTime();
  const daysUntilStart = Math.max(0, Math.round((start.getTime() - current.getTime()) / msPerDay));

  let dayNumber: number;
  let percentProgress: number;

  if (!isStarted) {
    dayNumber = 0;
    percentProgress = 0;
  } else {
    dayNumber = Math.min(totalChallengeDays, Math.max(1, Math.round((current.getTime() - start.getTime()) / msPerDay) + 1));
    percentProgress = Math.min(100, Math.max(0, Math.round((dayNumber / totalChallengeDays) * 100)));
  }

  return {
    daysRemaining,
    totalChallengeDays,
    dayNumber,
    percentProgress,
    isStarted,
    daysUntilStart,
  };
}

export function getRecentDaysWindow(currentDateStr: string = getTodayDateString(), daysBefore = 7, daysAfter = 2): string[] {
  const current = parseDate(currentDateStr);
  const dates: string[] = [];

  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date(current);
    d.setDate(current.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

/**
 * Checks if a habit is expected/scheduled for a given date based on its frequency.
 * - 'daily': all days (Sunday to Saturday)
 * - 'weekdays': Monday to Friday (day 1 to 5)
 * - 'weekends': Saturday and Sunday (day 0 and 6)
 * - '3x_week': Monday, Wednesday, Friday (day 1, 3, 5) or custom targetDays if provided
 */
export function isHabitScheduledForDate(
  habit: { frequency: 'daily' | 'weekdays' | 'weekends' | '3x_week' | '2x_week' | 'custom' | string; targetDays?: number[] },
  dateStr: string
): boolean {
  const date = parseDate(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (habit.targetDays && habit.targetDays.length > 0) {
    return habit.targetDays.includes(dayOfWeek);
  }

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      // Monday to Friday
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      // Saturday and Sunday
      return dayOfWeek === 0 || dayOfWeek === 6;
    case '3x_week':
      // Default: Segunda (1), Quarta (3), Sexta (5)
      return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    case '2x_week':
      // Default: Terça (2), Quinta (4)
      return dayOfWeek === 2 || dayOfWeek === 4;
    case 'custom':
      // If custom with no targetDays, default to daily
      return true;
    default:
      return true;
  }
}

/**
 * Calculates accurate daily progress considering habit frequencies.
 * Only habits scheduled for dateStr are counted towards the expected total.
 * If all scheduled habits are completed, returns 100%.
 * Habits not scheduled for today (e.g. weekdays on a Sunday, or 3x/week on a Tuesday)
 * do NOT interfere or prevent reaching 100%.
 */
export function getDayProgress(
  habits: Array<{ id: string; frequency: 'daily' | 'weekdays' | 'weekends' | '3x_week' | '2x_week' | 'custom' | string; targetDays?: number[] }>,
  completedHabitIds: string[],
  dateStr: string
): {
  scheduledHabitsCount: number;
  completedScheduledCount: number;
  percentage: number;
  isAllCompleted: boolean;
} {
  const scheduledHabits = habits.filter((h) => isHabitScheduledForDate(h, dateStr));
  const scheduledCount = scheduledHabits.length;

  if (habits.length === 0) {
    return {
      scheduledHabitsCount: 0,
      completedScheduledCount: 0,
      percentage: 0,
      isAllCompleted: false,
    };
  }

  if (scheduledCount === 0) {
    // If no habits were specifically scheduled for this day, but habits exist in app
    return {
      scheduledHabitsCount: 0,
      completedScheduledCount: 0,
      percentage: 100,
      isAllCompleted: true,
    };
  }

  const completedSet = new Set(completedHabitIds);
  const completedScheduledCount = scheduledHabits.filter((h) => completedSet.has(h.id)).length;
  const percentage = Math.min(100, Math.round((completedScheduledCount / scheduledCount) * 100));

  return {
    scheduledHabitsCount: scheduledCount,
    completedScheduledCount,
    percentage,
    isAllCompleted: completedScheduledCount >= scheduledCount,
  };
}

export function calculateStreak(dailyRecords: Record<string, { completedHabits: string[] }>, targetDateStr: string = getTodayDateString()): {
  currentStreak: number;
  bestStreak: number;
  totalCompletedHabitsCount: number;
} {
  let totalCompleted = 0;
  Object.values(dailyRecords).forEach(rec => {
    totalCompleted += rec?.completedHabits?.length || 0;
  });

  const allDates = Object.keys(dailyRecords).filter((k) => dailyRecords[k]?.completedHabits?.length > 0).sort();
  if (allDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalCompletedHabitsCount: 0 };
  }

  // Calculate current streak backwards from targetDateStr or yesterday if today has no habits yet
  let currentStreak = 0;
  const curr = parseDate(targetDateStr);
  
  // Check if today has at least 1 completed habit
  const todayRec = dailyRecords[targetDateStr];
  let checkDate = new Date(curr);

  if (!todayRec || todayRec.completedHabits.length === 0) {
    // Check if streak is alive from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    const rec = dailyRecords[key];
    if (rec && rec.completedHabits.length > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak dynamically across full timeline
  let bestStreak = currentStreak;
  let tempStreak = 0;
  
  const startDay = parseDate(allDates[0]);
  const endDay = parseDate(targetDateStr);
  const dayStep = new Date(startDay);

  while (dayStep <= endDay) {
    const y = dayStep.getFullYear();
    const m = String(dayStep.getMonth() + 1).padStart(2, '0');
    const d = String(dayStep.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    const rec = dailyRecords[key];
    if (rec && rec.completedHabits && rec.completedHabits.length > 0) {
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
    dayStep.setDate(dayStep.getDate() + 1);
  }

  return {
    currentStreak,
    bestStreak,
    totalCompletedHabitsCount: totalCompleted,
  };
}
