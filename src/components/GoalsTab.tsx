import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AreaGoal, LifeAreaId } from '../types';
import { LIFE_AREAS } from '../data/constants';

interface GoalsTabProps {
  goals: AreaGoal[];
  onUpdateGoal: (updatedGoal: AreaGoal) => void;
  onAddGoal: (newGoal: Omit<AreaGoal, 'id'>) => void;
  onDeleteGoal: (goalId: string) => void;
  onShowEncouragement: (message: string) => void;
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  goals,
  onUpdateGoal,
  onAddGoal,
  onDeleteGoal,
  onShowEncouragement,
}) => {
  const [selectedArea, setSelectedArea] = useState<LifeAreaId | 'all'>('all');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAreaId, setNewAreaId] = useState<LifeAreaId>('exercicio');
  const [newDeadline, setNewDeadline] = useState('31 de Dezembro');
  const [newMilestonesText, setNewMilestonesText] = useState('');

  const [addingMilestoneToGoalId, setAddingMilestoneToGoalId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const filteredGoals = goals.filter((g) => {
    if (selectedArea !== 'all' && g.areaId !== selectedArea) return false;
    return true;
  });

  const handleToggleMilestone = (goal: AreaGoal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    const allCompleted = updatedMilestones.length > 0 && updatedMilestones.every((m) => m.completed);

    const updatedGoal = {
      ...goal,
      milestones: updatedMilestones,
      completed: allCompleted,
    };

    onUpdateGoal(updatedGoal);

    const justCompleted = updatedMilestones.find((m) => m.id === milestoneId)?.completed;
    if (justCompleted) {
      onShowEncouragement('Marco conquistado! Mais um degrau subido rumo à sua meta de dezembro.');
      if (allCompleted) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#059669', '#2563eb', '#db2777'],
        });
      }
    }
  };

  const handleAddMilestone = (goal: AreaGoal) => {
    if (!newMilestoneTitle.trim()) return;
    const newM = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      completed: false,
    };

    const updatedGoal = {
      ...goal,
      milestones: [...goal.milestones, newM],
      completed: false,
    };

    onUpdateGoal(updatedGoal);
    setNewMilestoneTitle('');
    setAddingMilestoneToGoalId(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const milestones = newMilestonesText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((title, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        title,
        completed: false,
      }));

    onAddGoal({
      title: newTitle.trim(),
      targetDescription: newDescription.trim(),
      areaId: newAreaId,
      deadline: newDeadline.trim() || '31 de Dezembro',
      completed: false,
      milestones,
    });

    setNewTitle('');
    setNewDescription('');
    setNewMilestonesText('');
    setIsAddingGoal(false);
    onShowEncouragement('Nova meta estabelecida! O compromisso com o seu Eu de dezembro está selado.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header & Intro */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-600 font-mono tracking-wider uppercase font-semibold mb-1">
            <span>Diretrizes Estratégicas</span>
            <span aria-hidden="true">·</span>
            <span>Meta de 3 Meses</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Metas por Área da Vida
          </h1>
        </div>

        <button
          onClick={() => setIsAddingGoal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Definir Nova Meta</span>
        </button>
      </div>

      {/* 2. Area Filter Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-xl overflow-x-auto shadow-2xs">
        <button
          onClick={() => setSelectedArea('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            selectedArea === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Todas as Áreas ({goals.length})
        </button>
        {Object.values(LIFE_AREAS).map((area) => {
          const count = goals.filter((g) => g.areaId === area.id).length;
          const isSelected = selectedArea === area.id;
          return (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
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

      {/* 3. New Goal Form */}
      {isAddingGoal && (
        <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-md shadow-amber-500/5 animate-in fade-in duration-150 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
              <Target className="w-4 h-4 text-amber-600" />
              Nova Meta para o Desafio de Dezembro
            </h2>
            <button
              onClick={() => setIsAddingGoal(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título da Meta *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Correr 5km contínuos, Eliminar ultraprocessados, Faturar X..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Área da Vida *
                </label>
                <select
                  value={newAreaId}
                  onChange={(e) => setNewAreaId(e.target.value as LifeAreaId)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                >
                  {Object.values(LIFE_AREAS).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descrição & Resultado Esperado em 31 de Dezembro
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descreva exatamente como será o resultado atingido e como você se sentirá..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marcos / Etapas Intermediárias (Um por linha)
              </label>
              <textarea
                value={newMilestonesText}
                onChange={(e) => setNewMilestonesText(e.target.value)}
                placeholder="Ex:&#10;1º Mês: Não faltar mais de 2 treinos&#10;2º Mês: Bater 3km sem pausa&#10;3º Mês: Prova final de 5km"
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Salvar Meta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Goals Cards Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <p className="text-slate-500 text-sm font-medium">Nenhuma meta cadastrada para esta área ainda.</p>
          <button
            onClick={() => {
              if (selectedArea !== 'all') {
                setNewAreaId(selectedArea);
              }
              setIsAddingGoal(true);
            }}
            className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
          >
            Definir Primeira Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGoals.map((goal) => {
          const area = LIFE_AREAS[goal.areaId];
          const completedMilestones = goal.milestones.filter((m) => m.completed).length;
          const totalMilestones = goal.milestones.length;
          const progressPercent =
            totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

          return (
            <div
              key={goal.id}
              className={`bg-white border rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all shadow-xs ${
                goal.completed
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-2xs"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="font-bold text-slate-800">{area.label}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-mono">{goal.deadline}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {goal.completed && (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Conquistada
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir esta meta?')) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">{goal.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {goal.targetDescription}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono font-medium">
                    <span>Progresso dos Marcos</span>
                    <span className="tabular-nums font-bold text-slate-700">
                      {completedMilestones}/{totalMilestones} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500 shadow-2xs"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: goal.completed ? '#059669' : area.color,
                      }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Marcos Intermediários:
                  </span>
                  {goal.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      onClick={() => handleToggleMilestone(goal, milestone.id)}
                      className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors text-xs ${
                        milestone.completed
                          ? 'bg-emerald-50/50 text-slate-400 line-through'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                          milestone.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {milestone.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span className="flex-1 leading-snug font-medium">{milestone.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add milestone mini form */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {addingMilestoneToGoalId === goal.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      placeholder="Novo marco para esta meta..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMilestone(goal);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddMilestone(goal)}
                      className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 cursor-pointer"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => setAddingMilestoneToGoalId(null)}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingMilestoneToGoalId(goal.id)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>Adicionar Marco Intermediário</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
