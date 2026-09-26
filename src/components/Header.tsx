import React from 'react';
import { Flame, Plus, Sparkles, Bell } from 'lucide-react';
import { getDaysRemainingUntilDec31 } from '../utils/dates';
import { AuraLogo } from './AuraLogo';

interface HeaderProps {
  activeTab: 'today' | 'progress' | 'goals' | 'manifestation';
  onSelectTab: (tab: 'today' | 'progress' | 'goals' | 'manifestation') => void;
  streakCount: number;
  onOpenNewHabit: () => void;
  onOpenNotificationSettings?: () => void;
  notificationsActive?: boolean;
  startDate?: string | null;
  onStartChallenge?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  streakCount,
  onOpenNewHabit,
  onOpenNotificationSettings,
  notificationsActive = false,
  startDate,
  onStartChallenge,
}) => {
  const challengeStats = getDaysRemainingUntilDec31(startDate);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* 3-Zone Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark & logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onSelectTab('today')}
            className="text-left group cursor-pointer focus:outline-none"
            aria-label="Ir para Hoje"
          >
            <AuraLogo size="md" showSubtitle={true} />
          </button>
          <span className="hidden lg:inline text-xs text-slate-400 font-mono tracking-tight pl-2 border-l border-slate-200">
            3 Meses até Dezembro
          </span>
        </div>

        {/* Zone 2: Navigation Links / Segmented Tabs (Desktop/Tablet only, mobile uses Bottom Bar) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onSelectTab('today')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'today'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => onSelectTab('progress')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Progresso & Calendário
          </button>
          <button
            onClick={() => onSelectTab('goals')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Metas por Área
          </button>
          <button
            onClick={() => onSelectTab('manifestation')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'manifestation'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Lei da Atração
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification Settings button */}
          {onOpenNotificationSettings && (
            <button
              onClick={onOpenNotificationSettings}
              title="Configurações de Notificações Push"
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer active:scale-95"
              aria-label="Abrir configurações de notificações"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {notificationsActive && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
          )}

          {/* Streak indicator button */}
          <button
            onClick={() => onSelectTab('progress')}
            title={`Sequência ativa de ${streakCount} dias consecutivos. Clique para ver seu calendário e histórico.`}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs sm:text-sm font-bold tabular-nums shadow-xs transition-all cursor-pointer active:scale-95"
            aria-label={`Sequência de ${streakCount} dias. Ver progresso`}
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 fill-orange-500 shrink-0" />
            <span>{streakCount} <span className="hidden xs:inline">{streakCount === 1 ? 'dia' : 'dias'}</span></span>
          </button>

          {/* New habit CTA button */}
          <button
            onClick={onOpenNewHabit}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Novo Hábito</span>
          </button>
        </div>
      </div>

      {/* Challenge Countdown Banner */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border-t border-slate-200/70 py-1.5 sm:py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-slate-700 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/40 shrink-0"></span>
              <span className="font-bold text-slate-900 truncate">Desafio Minha Melhor Versão</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs">
              <span className="text-slate-300 hidden sm:inline">·</span>
              <span className="text-slate-600 font-medium">
                {challengeStats.isStarted ? (
                  `Dia ${challengeStats.dayNumber}/${challengeStats.totalChallengeDays}`
                ) : (
                  <span className="text-slate-500">Inicie quando quiser</span>
                )}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-amber-700 font-mono font-bold tabular-nums">
                {challengeStats.daysRemaining}d até 31 Dez
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            {challengeStats.isStarted ? (
              <>
                <div className="flex-1 sm:w-36 h-1.5 sm:h-2 bg-slate-200/80 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${challengeStats.percentProgress}%` }}
                  />
                </div>
                <span className="text-slate-700 font-mono font-bold text-[10px] sm:text-[11px] tabular-nums shrink-0">
                  {challengeStats.percentProgress}%
                </span>
              </>
            ) : onStartChallenge ? (
              <button
                type="button"
                onClick={onStartChallenge}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-[11px] rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>Começar Desafio Hoje</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
