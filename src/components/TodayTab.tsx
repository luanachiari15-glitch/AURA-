import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Flame,
  CheckCircle2,
  Edit3,
  Calendar,
  Layers,
  Heart,
  Compass,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Habit, DayRecord, LifeAreaId } from '../types';
import { LIFE_AREAS, ENCOURAGEMENT_PHRASES } from '../data/constants';
import { ConfirmModal } from './ConfirmModal';
import {
  formatDateToPtBr,
  getRecentDaysWindow,
  getDayOfWeekAbbr,
  getTodayDateString,
  formatShortDate,
  isHabitScheduledForDate,
  getDayProgress,
} from '../utils/dates';

interface TodayTabProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  habits: Habit[];
  dayRecord: DayRecord;
  onToggleHabit: (habitId: string) => void;
  onUpdateDayRecord: (record: Partial<DayRecord>) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  onOpenNewHabit: () => void;
  streakCount: number;
  onShowEncouragement: (message: string) => void;
  onSelectTab?: (tab: 'today' | 'progress' | 'goals' | 'manifestation') => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  selectedDate,
  onSelectDate,
  habits,
  dayRecord,
  onToggleHabit,
  onUpdateDayRecord,
  onEditHabit,
  onDeleteHabit,
  onOpenNewHabit,
  streakCount,
  onShowEncouragement,
  onSelectTab,
}) => {
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<LifeAreaId | 'all'>('all');
  const [noteText, setNoteText] = useState(dayRecord.note || '');
  const [gratitudeText, setGratitudeText] = useState(dayRecord.gratitude || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  const recentDates = getRecentDaysWindow(todayStr, 5, 2);

  // Filter habits for current day & area
  const activeHabits = habits.filter((h) => {
    if (selectedAreaFilter !== 'all' && h.areaId !== selectedAreaFilter) return false;
    return true;
  });

  // Calculate progress based on habits scheduled for selectedDate
  const dayProgress = getDayProgress(habits, dayRecord.completedHabits, selectedDate);
  const completionPercentage = dayProgress.percentage;
  const totalHabitsCount = dayProgress.scheduledHabitsCount;
  const completedHabitsCount = dayProgress.completedScheduledCount;

  const handleToggle = (habitId: string) => {
    const isNowCompleted = !dayRecord.completedHabits.includes(habitId);
    onToggleHabit(habitId);

    if (isNowCompleted) {
      const randomPhrase =
        ENCOURAGEMENT_PHRASES[Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length)];
      onShowEncouragement(randomPhrase);

      // Check if all scheduled habits are now completed
      const willBeCompleted = [...dayRecord.completedHabits, habitId];
      const nextProgress = getDayProgress(habits, willBeCompleted, selectedDate);
      if (nextProgress.isAllCompleted && nextProgress.scheduledHabitsCount > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#059669', '#2563eb', '#db2777', '#d97706'],
        });
      }
    }
  };

  const handleSaveNotes = () => {
    onUpdateDayRecord({
      note: noteText,
      gratitude: gratitudeText,
    });
    setIsEditingNotes(false);
    onShowEncouragement('Reflexão e gratidão registradas com sucesso! ✍️✨');
  };

  const areasList = Object.values(LIFE_AREAS).filter((area) => {
    if (selectedAreaFilter === 'all') {
      return habits.some((h) => h.areaId === area.id);
    }
    return area.id === selectedAreaFilter;
  });

  const DAY_ABBRS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const formatHabitFrequencyLabel = (habit: {
    frequency: string;
    targetDays?: number[];
  }): string => {
    if (habit.targetDays && habit.targetDays.length > 0 && habit.targetDays.length < 7) {
      if (habit.targetDays.length === 5 && [1, 2, 3, 4, 5].every((d) => habit.targetDays!.includes(d))) {
        return 'Seg-Sex';
      }
      if (habit.targetDays.length === 2 && [0, 6].every((d) => habit.targetDays!.includes(d))) {
        return 'Fins de semana';
      }
      if (habit.targetDays.length === 3 && [1, 3, 5].every((d) => habit.targetDays!.includes(d))) {
        return '3x/sem (Seg, Qua, Sex)';
      }
      if (habit.targetDays.length === 2 && [2, 4].every((d) => habit.targetDays!.includes(d))) {
        return '2x/sem (Ter, Qui)';
      }
      const daysStr = habit.targetDays.map((d) => DAY_ABBRS[d]).join(', ');
      return `${habit.targetDays.length}x/sem (${daysStr})`;
    }

    switch (habit.frequency) {
      case 'daily':
        return 'Diário';
      case 'weekdays':
        return 'Seg-Sex';
      case 'weekends':
        return 'Fins de semana';
      case '3x_week':
        return '3x/sem (Seg, Qua, Sex)';
      case '2x_week':
        return '2x/sem (Ter, Qui)';
      default:
        return 'Diário';
    }
  };

  const getDailyStatusGreeting = () => {
    if (habits.length === 0) {
      return 'Bem-vindo(a) ao AURA ✦ Cadastre seus primeiros hábitos para iniciar seu desafio diário.';
    }
    if (totalHabitsCount === 0) {
      return 'Nenhum hábito agendado para hoje. Aproveite para descansar ou revisar suas metas!';
    }
    if (completionPercentage === 100) {
      return '100% Concluído! Todos os hábitos previstos para hoje foram cumpridos com maestria. 🎉';
    }
    if (completionPercentage >= 70) {
      return 'Ritmo impecável. Você está a poucos passos de fechar o dia com chave de ouro.';
    }
    if (completionPercentage >= 40) {
      return 'Constância em ação. Cada hábito concluído reforça sua nova identidade.';
    }
    return 'Um novo dia para moldar a sua melhor versão. Dê o primeiro passo agora.';
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* 1. Date Selector Carousel & Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 font-mono tracking-wider uppercase font-semibold mb-0.5 sm:mb-1">
              <span>Desafio 3 Meses</span>
              <span aria-hidden="true">·</span>
              <span>{isToday ? 'Dia Atual' : 'Histórico'}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
              {formatDateToPtBr(selectedDate)}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              onClick={() => {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 1);
                const prevStr = prev.toISOString().split('T')[0];
                onSelectDate(prevStr);
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                onClick={() => onSelectDate(todayStr)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Voltar para Hoje
              </button>
            )}

            <button
              onClick={() => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 1);
                const nextStr = next.toISOString().split('T')[0];
                onSelectDate(nextStr);
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Mini Date Strip */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {recentDates.map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const isCurrentToday = dateStr === todayStr;
            const dayNum = dateStr.split('-')[2];
            const abbr = getDayOfWeekAbbr(dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`flex-1 min-w-[50px] sm:min-w-[58px] py-1.5 sm:py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'bg-slate-50 border border-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider mb-0.5 opacity-80">{abbr}</div>
                <div className="text-sm sm:text-base font-bold tabular-nums">{dayNum}</div>
                {isCurrentToday && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${
                      isSelected ? 'bg-amber-400' : 'bg-amber-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Overview Stats & Progress Ring Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Main Progress Ring & Encouragement */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 flex flex-row items-center gap-4 sm:gap-6 shadow-xs">
          {/* Circular SVG Ring */}
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 - (263.89 * completionPercentage) / 100}
                strokeLinecap="round"
                className="text-amber-500 transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-display tabular-nums">
                {completionPercentage}%
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                do dia
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-left space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
              <span className="text-slate-900 font-bold font-mono">
                {completedHabitsCount}/{totalHabitsCount} previstos
              </span>
              <span aria-hidden="true">·</span>
              <span>{Math.max(0, totalHabitsCount - completedHabitsCount)} pendentes</span>
              {completionPercentage === 100 && totalHabitsCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ✨ 100%
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug sm:leading-relaxed font-sans line-clamp-2">
              {getDailyStatusGreeting()}
            </p>
            <div className="pt-0.5 flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-600">
              {onSelectTab ? (
                <button
                  type="button"
                  onClick={() => onSelectTab('progress')}
                  className="flex items-center gap-1 font-medium hover:text-orange-600 transition-colors cursor-pointer"
                  title="Ver histórico e calendário"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />
                  <span className="text-slate-900 font-bold">{streakCount}d</span> seguidos
                </button>
              ) : (
                <div className="flex items-center gap-1 font-medium">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />
                  <span className="text-slate-900 font-bold">{streakCount}d</span> seguidos
                </div>
              )}

              {onSelectTab ? (
                <button
                  type="button"
                  onClick={() => onSelectTab('goals')}
                  className="flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                  title="Ver metas estratégicas de 3 meses"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rumo à Dezembro</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 font-medium text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rumo à Dezembro</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Affirmation of the Day */}
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Afirmação Matinal
              </span>
              <span className="text-[10px] text-amber-600/80 uppercase tracking-widest font-mono font-bold">
                Vibração Alta
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed pt-1 font-medium">
              "Cada escolha consciente que faço hoje ancora a realidade abundante e realizada que
              celebro em dezembro."
            </p>
          </div>
          <div className="pt-3 border-t border-amber-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Lei da Atração & Identidade</span>
            {onSelectTab ? (
              <button
                type="button"
                onClick={() => onSelectTab('manifestation')}
                className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
              >
                <span>Práticas da Atração</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-amber-700 font-bold">Eu Ideal</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Filter by Life Area Controls */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-xl overflow-x-auto shadow-2xs">
          <button
            onClick={() => setSelectedAreaFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedAreaFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Todas as Áreas ({habits.length})
          </button>
          {Object.values(LIFE_AREAS).map((area) => {
            const count = habits.filter((h) => h.areaId === area.id).length;
            const isSelected = selectedAreaFilter === area.id;
            return (
              <button
                key={area.id}
                onClick={() => setSelectedAreaFilter(area.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: area.color }}
                />
                <span>{area.shortLabel}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenNewHabit}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200/80 border border-amber-300/80 rounded-xl transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Adicionar Hábito</span>
        </button>
      </div>

      {/* 4. Habits List Grouped by Life Area */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Nenhum hábito cadastrado ainda
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Você está no controle total. Cadastre seus próprios hábitos para o desafio e acompanhe sua evolução diária.
              </p>
            </div>
            <button
              onClick={onOpenNewHabit}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Primeiro Hábito</span>
            </button>
          </div>
        ) : areasList.filter((area) => habits.some((h) => h.areaId === area.id)).length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <p className="text-slate-500 text-sm font-medium">Nenhum hábito cadastrado nesta área ainda.</p>
            <button
              onClick={onOpenNewHabit}
              className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
            >
              Criar Hábito Nesta Área
            </button>
          </div>
        ) : (
          areasList.map((area) => {
            const areaHabits = habits.filter((h) => h.areaId === area.id);
            if (areaHabits.length === 0) return null;

            // Only count scheduled habits for the area's completion indicator
            const scheduledAreaHabits = areaHabits.filter((h) => isHabitScheduledForDate(h, selectedDate));
            const areaCompleted = scheduledAreaHabits.filter((h) =>
              dayRecord.completedHabits.includes(h.id)
            ).length;
            const areaAllDone =
              scheduledAreaHabits.length > 0
                ? areaCompleted >= scheduledAreaHabits.length
                : true;

            return (
              <div
                key={area.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Area Header */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: area.color }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">
                        {area.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 hidden sm:block">
                        {area.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums font-mono font-medium">
                    {scheduledAreaHabits.length > 0 ? (
                      <span className={areaAllDone ? 'text-emerald-600 font-bold' : ''}>
                        {areaCompleted} de {scheduledAreaHabits.length} previstos
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Folga hoje</span>
                    )}
                    {areaAllDone && scheduledAreaHabits.length > 0 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                </div>

                {/* Habit Rows */}
                <div className="divide-y divide-slate-100">
                  {areaHabits.map((habit) => {
                    const isCompleted = dayRecord.completedHabits.includes(habit.id);
                    const isScheduledToday = isHabitScheduledForDate(habit, selectedDate);

                    return (
                      <div
                        key={habit.id}
                        className={`group px-3.5 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-50/30 hover:bg-emerald-50/50'
                            : !isScheduledToday
                            ? 'bg-slate-50/40 opacity-80 hover:bg-slate-50/70'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Checkbox & Details */}
                        <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggle(habit.id)}
                            className={`w-7 h-7 sm:w-6 sm:h-6 rounded-xl sm:rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 ${
                              isCompleted
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'border-2 border-slate-300 group-hover:border-amber-500 bg-white'
                            }`}
                            aria-label={`Marcar ${habit.title} como ${
                              isCompleted ? 'pendente' : 'concluído'
                            }`}
                          >
                            {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>

                          <div
                            onClick={() => handleToggle(habit.id)}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <p
                                className={`text-xs sm:text-sm font-semibold transition-colors truncate ${
                                  isCompleted
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-800 group-hover:text-slate-950'
                                }`}
                              >
                                {habit.title}
                              </p>
                              {!isScheduledToday && (
                                <span
                                  className={`text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 font-medium border ${
                                    isCompleted
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200/80'
                                  }`}
                                  title="Hábitos fora da frequência agendada não interferem no 100% do dia"
                                >
                                  {isCompleted
                                    ? '⭐ Extra'
                                    : 'Folga hoje · Não afeta 100%'}
                                </span>
                              )}
                            </div>
                            {habit.description && (
                              <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                                {habit.description}
                              </p>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block md:hidden">
                              {formatHabitFrequencyLabel(habit)}
                            </span>
                          </div>
                        </div>

                        {/* Frequency & Edit action */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <span
                            className={`text-[11px] font-mono hidden md:inline ${
                              isScheduledToday ? 'text-slate-600 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {formatHabitFrequencyLabel(habit)}
                          </span>

                          <button
                            onClick={() => onEditHabit(habit)}
                            className="p-2 text-slate-400 hover:text-slate-700 active:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar hábito"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteHabit && (
                            <button
                              onClick={() => setHabitToDelete(habit)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors cursor-pointer active:scale-90"
                              title="Excluir hábito"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Daily Notes & Gratitude Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Reflexão, Gratidão & Registro do Dia
            </h2>
          </div>
          {!isEditingNotes ? (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
            >
              Editar Anotações
            </button>
          ) : (
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
            >
              Salvar
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Anotações e Insights do Dia (O que fiz hoje pela minha melhor versão?)
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ex: Como me senti, superação de obstáculos, vitórias silenciosas..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3 Motivos de Gratidão Sincera
              </label>
              <textarea
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="Ex: 1. Pela saúde do meu corpo, 2. Pelo avanço no trabalho, 3. Por acreditar no meu potencial..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <span className="font-bold text-slate-500 block mb-1">Anotações do Dia:</span>
              <p className="text-slate-700 leading-relaxed italic">
                {dayRecord.note || 'Nenhuma anotação registrada ainda para esta data.'}
              </p>
            </div>
            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60">
              <span className="font-bold text-amber-700 block mb-1">Gratidão Expressa:</span>
              <p className="text-slate-700 leading-relaxed italic">
                {dayRecord.gratitude ||
                  'Registre pelo que você é grato(a) hoje para elevar sua frequência vibracional.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* In-app Delete Habit Confirmation Modal */}
      <ConfirmModal
        isOpen={!!habitToDelete}
        title="Excluir Hábito"
        message={`Tem certeza que deseja excluir o hábito "${habitToDelete?.title}"? Esta ação removerá o hábito do seu desafio diário.`}
        confirmLabel="Excluir Hábito"
        onConfirm={() => {
          if (habitToDelete && onDeleteHabit) {
            onDeleteHabit(habitToDelete.id);
            onShowEncouragement('Hábito removido com sucesso.');
            setHabitToDelete(null);
          }
        }}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
};
