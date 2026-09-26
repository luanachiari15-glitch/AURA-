import React from 'react';
import { Flame, Plus, Sparkles } from 'lucide-react';
import { getDaysRemainingUntilDec31 } from '../utils/dates';

interface HeaderProps {
  activeTab: 'today' | 'progress' | 'goals' | 'manifestation';
  onSelectTab: (tab: 'today' | 'progress' | 'goals' | 'manifestation') => void;
  streakCount: number;
  onOpenNewHabit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  streakCount,
  onOpenNewHabit,
}) => {
  const challengeStats = getDaysRemainingUntilDec31();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* 3-Zone Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('today')}
            className="text-left group cursor-pointer focus:outline-none flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm shadow-amber-500/20">
              V
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
              VÉRTEX
            </span>
          </button>
          <span className="hidden sm:inline text-xs text-slate-400 font-mono tracking-tight">
            / 3 Meses até Dezembro
          </span>
        </div>

        {/* Zone 2: Navigation Links / Segmented Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak indicator */}
          <div
            title={`Sequência ativa de ${streakCount} dias consecutivos`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs sm:text-sm font-bold tabular-nums shadow-xs"
          >
            <Flame className="w-4 h-4 text-orange-600 fill-orange-500 shrink-0" />
            <span>{streakCount} {streakCount === 1 ? 'dia' : 'dias'}</span>
          </div>

          {/* New habit CTA button */}
          <button
            onClick={onOpenNewHabit}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Hábito</span>
          </button>
        </div>
      </div>

      {/* Challenge Countdown Banner */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border-t border-slate-200/70 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/40"></span>
            <span className="font-bold text-slate-900">Desafio Minha Melhor Versão</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600">Dia {challengeStats.dayNumber} de {challengeStats.totalChallengeDays}</span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="text-amber-700 font-mono font-bold hidden sm:inline tabular-nums">
              {challengeStats.daysRemaining} dias até 31 de Dezembro
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-40 h-2 bg-slate-200/80 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${challengeStats.percentProgress}%` }}
              />
            </div>
            <span className="text-slate-700 font-mono font-bold text-[11px] tabular-nums shrink-0">
              {challengeStats.percentProgress}% concluído
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
