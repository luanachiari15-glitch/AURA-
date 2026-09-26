import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Habit, LifeAreaId } from '../types';
import { LIFE_AREAS } from '../data/constants';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  editingHabit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingHabit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState<LifeAreaId>('exercicio');
  const [frequency, setFrequency] = useState<
    'daily' | 'weekdays' | 'weekends' | '3x_week' | '2x_week' | 'custom'
  >('daily');
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const PRESET_DAYS: Record<string, number[]> = {
    daily: [0, 1, 2, 3, 4, 5, 6],
    weekdays: [1, 2, 3, 4, 5],
    weekends: [0, 6],
    '3x_week': [1, 3, 5],
    '2x_week': [2, 4],
  };

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setDescription(editingHabit.description || '');
      setAreaId(editingHabit.areaId);
      setFrequency(editingHabit.frequency || 'daily');
      if (editingHabit.targetDays && editingHabit.targetDays.length > 0) {
        setTargetDays(editingHabit.targetDays);
      } else {
        setTargetDays(PRESET_DAYS[editingHabit.frequency] || [0, 1, 2, 3, 4, 5, 6]);
      }
    } else {
      setTitle('');
      setDescription('');
      setAreaId('exercicio');
      setFrequency('daily');
      setTargetDays([0, 1, 2, 3, 4, 5, 6]);
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSelectFrequency = (fId: 'daily' | 'weekdays' | 'weekends' | '3x_week' | '2x_week' | 'custom') => {
    setFrequency(fId);
    if (fId !== 'custom' && PRESET_DAYS[fId]) {
      setTargetDays(PRESET_DAYS[fId]);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    let next: number[];
    if (targetDays.includes(dayIndex)) {
      if (targetDays.length === 1) return; // keep at least 1 day
      next = targetDays.filter((d) => d !== dayIndex);
    } else {
      next = [...targetDays, dayIndex].sort();
    }
    setTargetDays(next);
    setFrequency('custom');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        title: title.trim(),
        description: description.trim(),
        areaId,
        frequency,
        targetDays,
      },
      editingHabit ? editingHabit.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-display">
            {editingHabit ? 'Editar Hábito' : 'Novo Hábito para o Desafio'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
              Nome do Hábito *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treino de pernas, 2.5L de água, 20 min de leitura..."
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
              Área da Vida *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(LIFE_AREAS).map((area) => {
                const isSelected = areaId === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setAreaId(area.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="truncate">{area.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 font-sans">
                Frequência
              </label>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                {targetDays.length} {targetDays.length === 1 ? 'dia' : 'dias'} por semana
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2.5">
              {[
                { id: 'daily', label: 'Todos os dias' },
                { id: '3x_week', label: '3x / semana' },
                { id: '2x_week', label: '2x / semana' },
                { id: 'weekdays', label: 'Seg a Sex' },
                { id: 'weekends', label: 'Fim de semana' },
                { id: 'custom', label: 'Personalizado' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelectFrequency(f.id as any)}
                  className={`py-2 px-1 rounded-xl border text-[11px] text-center font-bold transition-all cursor-pointer ${
                    frequency === f.id
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Interactive Day of the Week Pills */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5 space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                <span>Dias em que o hábito será cobrado:</span>
                <span className="text-[10px] text-slate-400 font-mono">(toque para ativar/desativar)</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[
                  { day: 0, label: 'Dom', short: 'D' },
                  { day: 1, label: 'Seg', short: 'S' },
                  { day: 2, label: 'Ter', short: 'T' },
                  { day: 3, label: 'Qua', short: 'Q' },
                  { day: 4, label: 'Qui', short: 'Q' },
                  { day: 5, label: 'Sex', short: 'S' },
                  { day: 6, label: 'Sáb', short: 'S' },
                ].map(({ day, label }) => {
                  const isActive = targetDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                💡 Nos dias desmarcados (folga), este hábito <strong className="text-slate-700">não interfere</strong> e o dia poderá alcançar 100% de conclusão.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
              Nota / Instrução (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Como executar, horário ideal ou gatilho..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white text-sm resize-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {editingHabit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja remover este hábito?')) {
                    onDelete(editingHabit.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-semibold cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Hábito</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                {editingHabit ? 'Salvar Alterações' : 'Criar Hábito'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
