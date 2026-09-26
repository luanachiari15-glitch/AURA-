import React, { useState } from 'react';
import {
  Flame,
  Award,
  CheckCircle2,
  Calendar as CalendarIcon,
  TrendingUp,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Habit, DayRecord, LifeAreaId } from '../types';
import { LIFE_AREAS } from '../data/constants';
import {
  calculateStreak,
  getTodayDateString,
  parseDate,
  getDayProgress,
  isHabitScheduledForDate,
  CHALLENGE_START_DATE,
} from '../utils/dates';
import { exportAppData, validateAndParseBackup, applyBackupData } from '../utils/storage';

interface ProgressTabProps {
  habits: Habit[];
  dayRecords: Record<string, DayRecord>;
  onSelectDate: (date: string) => void;
  onRefreshData: () => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  habits,
  dayRecords,
  onSelectDate,
  onRefreshData,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear] = useState<number>(new Date().getFullYear());
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const streakStats = calculateStreak(dayRecords);
  const todayStr = getTodayDateString();

  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  let perfectDaysCount = 0;
  let totalLogsCount = 0;
  Object.entries(dayRecords).forEach(([dKey, rec]) => {
    if (rec.completedHabits.length > 0) {
      totalLogsCount++;
      const progress = getDayProgress(habits, rec.completedHabits, dKey);
      if (progress.percentage === 100 && progress.scheduledHabitsCount > 0) {
        perfectDaysCount++;
      }
    }
  });

  const areaStats: Record<LifeAreaId, { completedCount: number; percentage: number }> = {} as any;
  Object.values(LIFE_AREAS).forEach((area) => {
    const areaHabits = habits.filter((h) => h.areaId === area.id);
    const areaHabitIds = new Set(areaHabits.map((h) => h.id));

    let areaCompletions = 0;
    let scheduledTotal = 0;

    Object.entries(dayRecords).forEach(([dKey, rec]) => {
      // For each day, count how many habits of this area were scheduled
      const scheduledInArea = areaHabits.filter((h) => isHabitScheduledForDate(h, dKey)).length;
      scheduledTotal += scheduledInArea;

      rec.completedHabits.forEach((hId) => {
        if (areaHabitIds.has(hId)) areaCompletions++;
      });
    });

    const percentage = scheduledTotal > 0 ? Math.round((areaCompletions / scheduledTotal) * 100) : 0;
    areaStats[area.id] = { completedCount: areaCompletions, percentage };
  });

  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    dateStr: string;
    completionPercent: number;
    completedCount: number;
    scheduledCount: number;
    isToday: boolean;
    isFuture: boolean;
  }> = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const rec = dayRecords[dStr];
    const completedList = rec ? rec.completedHabits : [];
    const progress = getDayProgress(habits, completedList, dStr);
    const isToday = dStr === todayStr;
    const isFuture = dStr > todayStr;

    calendarDays.push({
      dayNumber: i,
      dateStr: dStr,
      completionPercent: completedList.length > 0 ? progress.percentage : 0,
      completedCount: progress.completedScheduledCount,
      scheduledCount: progress.scheduledHabitsCount,
      isToday,
      isFuture,
    });
  }

  const handleExport = () => {
    const json = exportAppData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_desafio_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateAndParseBackup(content);
      if (result.success && result.data) {
        applyBackupData(result.data);
        setImportStatus('Dados restaurados com sucesso!');
        onRefreshData();
      } else {
        setImportStatus(result.error || 'Erro ao importar arquivo. Verifique o formato.');
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-600 font-mono tracking-wider uppercase font-semibold mb-0.5 sm:mb-1">
            <span>Evolução do Desafio</span>
            <span aria-hidden="true">·</span>
            <span>Setembro a Dezembro</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Progresso & Estatísticas
          </h1>
        </div>

        {/* Backup Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs hover:bg-slate-50 cursor-pointer active:scale-95"
            title="Exportar backup dos seus dados"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar</span>
          </button>

          <label className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs hover:bg-slate-50 cursor-pointer active:scale-95">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Importar</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-center font-bold">
          {importStatus}
        </div>
      )}

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 space-y-1 sm:space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="text-[11px] sm:text-xs">Sequência Ativa</span>
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500/20" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums">
            {streakStats.currentStreak}
            <span className="text-xs font-normal text-slate-400 ml-1 font-sans">dias</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Consistência diária</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 space-y-1 sm:space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="text-[11px] sm:text-xs">Melhor Sequência</span>
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums">
            {streakStats.bestStreak}
            <span className="text-xs font-normal text-slate-400 ml-1 font-sans">dias</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Seu recorde de foco</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 space-y-1 sm:space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="text-[11px] sm:text-xs">Total Concluído</span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums">
            {streakStats.totalCompletedHabitsCount}
            <span className="text-xs font-normal text-slate-400 ml-1 font-sans">ações</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Hábitos cumpridos</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 space-y-1 sm:space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="text-[11px] sm:text-xs">Dias 100% Feitos</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tabular-nums">
            {perfectDaysCount}
            <span className="text-xs font-normal text-slate-400 ml-1 font-sans">dias</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Aproveitamento total</p>
        </div>
      </div>

      {/* 3. Monthly Challenge Calendar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display">
              {monthsNames[selectedMonth]} {selectedYear}
            </h2>
          </div>

          {/* Month Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl overflow-x-auto max-w-full">
            {[8, 9, 10, 11].map((mIdx) => (
              <button
                key={mIdx}
                onClick={() => setSelectedMonth(mIdx)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedMonth === mIdx
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {monthsNames[mIdx].substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold text-slate-400 pb-2 border-b border-slate-100 uppercase font-mono">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2 sm:pt-3">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 sm:h-16 rounded-lg sm:rounded-xl bg-slate-50/50" />
            ))}

            {calendarDays.map((item) => {
              let dotBg = 'bg-slate-50 border-slate-200 text-slate-400';
              if (item.completionPercent === 100) {
                dotBg = 'bg-emerald-50/80 border-emerald-300 text-emerald-800';
              } else if (item.completionPercent >= 50) {
                dotBg = 'bg-amber-50/90 border-amber-300 text-amber-800';
              } else if (item.completedCount > 0) {
                dotBg = 'bg-blue-50/80 border-blue-200 text-blue-800';
              }

              return (
                <button
                  key={item.dateStr}
                  onClick={() => onSelectDate(item.dateStr)}
                  disabled={item.isFuture}
                  className={`h-12 sm:h-16 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer active:scale-95 ${
                    item.isToday
                      ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/40 shadow-xs'
                      : item.isFuture
                      ? 'border-slate-100 bg-slate-50/40 opacity-40 cursor-not-allowed'
                      : `${dotBg} hover:border-slate-400 hover:shadow-2xs`
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="font-bold tabular-nums font-mono leading-none">{item.dayNumber}</span>
                    {item.isToday ? (
                      <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-700 uppercase font-mono">Hoje</span>
                    ) : item.dateStr === CHALLENGE_START_DATE ? (
                      <span className="text-[7px] sm:text-[8px] font-bold text-emerald-700 bg-emerald-100/90 px-1 py-0.5 rounded uppercase font-mono">Início</span>
                    ) : null}
                  </div>

                  {!item.isFuture && item.completedCount > 0 ? (
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="w-full h-1 sm:h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${item.completionPercent}%` }}
                        />
                      </div>
                      <span className="text-[8px] sm:text-[10px] text-slate-600 font-mono font-bold block tabular-nums leading-none">
                        {item.completionPercent}%
                      </span>
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-300 leading-none">-</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-600 border-t border-slate-100 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>100% Concluído</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>50% a 99% Concluído</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span>1% a 49% Concluído</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-200" />
            <span>Sem registro</span>
          </div>
        </div>
      </div>

      {/* 4. Consistency by Life Area Breakdown */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 font-display">
            Consistência por Área da Vida
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Acompanhe o equilíbrio entre suas prioridades para garantir uma transformação integral até dezembro.
        </p>

        <div className="space-y-4 pt-2">
          {Object.values(LIFE_AREAS).map((area) => {
            const stats = areaStats[area.id] || { completedCount: 0, percentage: 0 };
            return (
              <div key={area.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-2xs"
                      style={{ backgroundColor: area.color }}
                    />
                    <span>{area.label}</span>
                  </div>
                  <span className="font-mono text-slate-600 font-bold tabular-nums">
                    {stats.completedCount} vezes ({stats.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-2xs"
                    style={{
                      width: `${Math.max(5, stats.percentage)}%`,
                      backgroundColor: area.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
