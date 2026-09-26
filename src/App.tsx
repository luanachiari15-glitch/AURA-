/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Compass,
  Flame,
  LayoutDashboard,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react';
import { Habit, DayRecord, AreaGoal, Affirmation, VisionItem } from './types';
import {
  loadHabits,
  saveHabits,
  loadDayRecords,
  saveDayRecords,
  loadGoals,
  saveGoals,
  loadAffirmations,
  saveAffirmations,
  loadVisionItems,
  saveVisionItems,
} from './utils/storage';
import { getTodayDateString, calculateStreak } from './utils/dates';
import { Header } from './components/Header';
import { TodayTab } from './components/TodayTab';
import { ProgressTab } from './components/ProgressTab';
import { GoalsTab } from './components/GoalsTab';
import { ManifestationTab } from './components/ManifestationTab';
import { HabitModal } from './components/HabitModal';
import { EncouragementToast } from './components/EncouragementToast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'progress' | 'goals' | 'manifestation'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // App Data States
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [dayRecords, setDayRecords] = useState<Record<string, DayRecord>>(() => loadDayRecords());
  const [goals, setGoals] = useState<AreaGoal[]>(() => loadGoals());
  const [affirmations, setAffirmations] = useState<Affirmation[]>(() => loadAffirmations());
  const [visionItems, setVisionItems] = useState<VisionItem[]>(() => loadVisionItems());

  // UI States
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);

  // Synchronize to localStorage
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveDayRecords(dayRecords);
  }, [dayRecords]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveAffirmations(affirmations);
  }, [affirmations]);

  useEffect(() => {
    saveVisionItems(visionItems);
  }, [visionItems]);

  // Encouragement notification auto-dismiss
  const showEncouragement = (message: string) => {
    setEncouragementMessage(message);
    setTimeout(() => {
      setEncouragementMessage((prev) => (prev === message ? null : prev));
    }, 4500);
  };

  // Get or initialize DayRecord for selected date
  const currentDayRecord: DayRecord = dayRecords[selectedDate] || {
    date: selectedDate,
    completedHabits: [],
    note: '',
    gratitude: '',
    practices: {
      visualization: false,
      gratitude: false,
      affirmation: false,
      futureSelfAction: false,
      nightScripting: false,
    },
  };

  const streakStats = calculateStreak(dayRecords, getTodayDateString());

  // Habit Toggle Handler
  const handleToggleHabit = (habitId: string) => {
    const isCompleted = currentDayRecord.completedHabits.includes(habitId);
    const updatedCompleted = isCompleted
      ? currentDayRecord.completedHabits.filter((id) => id !== habitId)
      : [...currentDayRecord.completedHabits, habitId];

    const updatedRecord: DayRecord = {
      ...currentDayRecord,
      completedHabits: updatedCompleted,
    };

    setDayRecords((prev) => ({
      ...prev,
      [selectedDate]: updatedRecord,
    }));
  };

  // Day Record update handler (notes, gratitude, LoA practices)
  const handleUpdateDayRecord = (recordPatch: Partial<DayRecord>) => {
    const updatedRecord: DayRecord = {
      ...currentDayRecord,
      ...recordPatch,
    };

    setDayRecords((prev) => ({
      ...prev,
      [selectedDate]: updatedRecord,
    }));
  };

  // Habit Create / Update / Delete
  const handleSaveHabit = (
    habitData: Omit<Habit, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setHabits((prev) =>
        prev.map((h) => (h.id === existingId ? { ...h, ...habitData } : h))
      );
      showEncouragement('Hábito atualizado com sucesso!');
    } else {
      const newHabit: Habit = {
        ...habitData,
        id: `h-${Date.now()}`,
        createdAt: selectedDate,
      };
      setHabits((prev) => [...prev, newHabit]);
      showEncouragement('Novo hábito adicionado ao seu desafio!');
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    // Remove habit from current day records
    setDayRecords((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((dateKey) => {
        next[dateKey] = {
          ...next[dateKey],
          completedHabits: next[dateKey].completedHabits.filter((id) => id !== habitId),
        };
      });
      return next;
    });
    showEncouragement('Hábito removido.');
  };

  // Goals Handlers
  const handleUpdateGoal = (updatedGoal: AreaGoal) => {
    setGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const handleAddGoal = (newGoalData: Omit<AreaGoal, 'id'>) => {
    const newGoal: AreaGoal = {
      ...newGoalData,
      id: `g-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Affirmations Handlers
  const handleAddAffirmation = (text: string) => {
    const newAff: Affirmation = {
      id: `a-${Date.now()}`,
      text,
      isCustom: true,
    };
    setAffirmations((prev) => [newAff, ...prev]);
  };

  const handleDeleteAffirmation = (id: string) => {
    setAffirmations((prev) => prev.filter((a) => a.id !== id));
  };

  // Vision Items Handlers
  const handleAddVisionItem = (itemData: Omit<VisionItem, 'id'>) => {
    const newItem: VisionItem = {
      ...itemData,
      id: `v-${Date.now()}`,
    };
    setVisionItems((prev) => [...prev, newItem]);
  };

  const handleDeleteVisionItem = (id: string) => {
    setVisionItems((prev) => prev.filter((v) => v.id !== id));
  };

  const handleRefreshData = () => {
    setHabits(loadHabits());
    setDayRecords(loadDayRecords());
    setGoals(loadGoals());
    setAffirmations(loadAffirmations());
    setVisionItems(loadVisionItems());
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans pb-20 md:pb-10 selection:bg-amber-400 selection:text-slate-900">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        streakCount={streakStats.currentStreak}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'today' && (
          <TodayTab
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            habits={habits}
            dayRecord={currentDayRecord}
            onToggleHabit={handleToggleHabit}
            onUpdateDayRecord={handleUpdateDayRecord}
            onEditHabit={(habit) => {
              setEditingHabit(habit);
              setIsHabitModalOpen(true);
            }}
            onOpenNewHabit={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
            streakCount={streakStats.currentStreak}
            onShowEncouragement={showEncouragement}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            habits={habits}
            dayRecords={dayRecords}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setActiveTab('today');
            }}
            onRefreshData={handleRefreshData}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsTab
            goals={goals}
            onUpdateGoal={handleUpdateGoal}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onShowEncouragement={showEncouragement}
          />
        )}

        {activeTab === 'manifestation' && (
          <ManifestationTab
            dayRecord={currentDayRecord}
            onUpdateDayRecord={handleUpdateDayRecord}
            affirmations={affirmations}
            onAddAffirmation={handleAddAffirmation}
            onDeleteAffirmation={handleDeleteAffirmation}
            visionItems={visionItems}
            onAddVisionItem={handleAddVisionItem}
            onDeleteVisionItem={handleDeleteVisionItem}
            onShowEncouragement={showEncouragement}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'today' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Hoje</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'progress' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Progresso</span>
        </button>

        <button
          onClick={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
          className="w-11 h-11 -mt-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30 active:scale-95 transition-transform cursor-pointer"
          aria-label="Adicionar Hábito"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'goals' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Metas</span>
        </button>

        <button
          onClick={() => setActiveTab('manifestation')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'manifestation' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Atração</span>
        </button>
      </div>

      {/* Habit Creation / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        editingHabit={editingHabit}
      />

      {/* Encouragement Floating Toast */}
      <EncouragementToast
        message={encouragementMessage}
        onClose={() => setEncouragementMessage(null)}
      />
    </div>
  );
}
