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
  requestPersistentStorage,
  syncFromIndexedDBIfAvailable,
  AuraBackupData,
  applyBackupData,
  loadChallengeStartDate,
  saveChallengeStartDate,
} from './utils/storage';
import { getTodayDateString, calculateStreak, resolveChallengeStartDate } from './utils/dates';
import { Header } from './components/Header';
import { TodayTab } from './components/TodayTab';
import { ProgressTab } from './components/ProgressTab';
import { GoalsTab } from './components/GoalsTab';
import { ManifestationTab } from './components/ManifestationTab';
import { HabitModal } from './components/HabitModal';
import { EncouragementToast } from './components/EncouragementToast';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  registerAuraServiceWorker,
  syncPushSettingsWithBackend,
} from './utils/notifications';
import { NotificationSettings } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'progress' | 'goals' | 'manifestation'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // App Data States
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [dayRecords, setDayRecords] = useState<Record<string, DayRecord>>(() => loadDayRecords());
  const [goals, setGoals] = useState<AreaGoal[]>(() => loadGoals());
  const [affirmations, setAffirmations] = useState<Affirmation[]>(() => loadAffirmations());
  const [visionItems, setVisionItems] = useState<VisionItem[]>(() => loadVisionItems());
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    loadNotificationSettings()
  );
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(() =>
    loadChallengeStartDate()
  );

  const effectiveStartDate = resolveChallengeStartDate(challengeStartDate, dayRecords);

  // UI States
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);

  // 1. Service Worker & Storage Persistence Setup
  useEffect(() => {
    registerAuraServiceWorker();
    requestPersistentStorage();

    // Recover from IndexedDB if localStorage was cleared
    syncFromIndexedDBIfAvailable().then((res) => {
      if (res.recovered) {
        if (res.habits) setHabits(res.habits);
        if (res.goals) setGoals(res.goals);
        if (res.dayRecords) setDayRecords(res.dayRecords);
        if (res.affirmations) setAffirmations(res.affirmations);
        if (res.visionItems) setVisionItems(res.visionItems);
        if (res.settings) setNotificationSettings(res.settings);
        if (res.challengeStartDate !== undefined) setChallengeStartDate(res.challengeStartDate);
      }
    });
  }, []);

  // 2. Real Calendar Midnight Detection & Rollover
  useEffect(() => {
    let lastObservedToday = getTodayDateString();

    const checkMidnightRollover = () => {
      const currentToday = getTodayDateString();
      if (currentToday !== lastObservedToday) {
        // Midnight has passed in device local time
        setSelectedDate((prevDate) => {
          // If viewing yesterday's date, advance smoothly to today
          if (prevDate === lastObservedToday) {
            return currentToday;
          }
          return prevDate;
        });
        lastObservedToday = currentToday;
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkMidnightRollover, 30000);

    // Also check immediately when app becomes visible or gains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkMidnightRollover();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkMidnightRollover);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkMidnightRollover);
    };
  }, []);

  // 3. Restore Backup Handler
  const handleRestoreBackup = (data: AuraBackupData['data']) => {
    setHabits(data.habits);
    setGoals(data.goals);
    setDayRecords(data.dayRecords);
    setAffirmations(data.affirmations);
    setVisionItems(data.visionItems);
    if (data.notificationSettings) {
      setNotificationSettings(data.notificationSettings);
    }
    if (data.challengeStartDate !== undefined) {
      setChallengeStartDate(data.challengeStartDate);
      saveChallengeStartDate(data.challengeStartDate);
    }
    applyBackupData(data);
  };

  const handleStartChallenge = () => {
    const today = getTodayDateString();
    setChallengeStartDate(today);
    saveChallengeStartDate(today);
    showEncouragement('Desafio iniciado com sucesso! Rumo a 31 de Dezembro! 🚀✨');
  };

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
    // Sync affirmations with backend push service
    if (notificationSettings.enabled) {
      syncPushSettingsWithBackend(
        notificationSettings,
        affirmations.map((a) => a.text)
      );
    }
  }, [affirmations, notificationSettings]);

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans pb-28 md:pb-12 selection:bg-amber-400 selection:text-slate-900">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        streakCount={streakStats.currentStreak}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
        notificationsActive={notificationSettings.enabled}
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
            onSelectTab={setActiveTab}
            onDeleteHabit={handleDeleteHabit}
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

      {/* Mobile Sticky Bottom Tab Bar with Safe-Area support */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'text-amber-700 font-bold bg-amber-50/90 shadow-2xs'
              : 'text-slate-400 hover:text-slate-700 active:scale-95'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Hoje</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'progress'
              ? 'text-amber-700 font-bold bg-amber-50/90 shadow-2xs'
              : 'text-slate-400 hover:text-slate-700 active:scale-95'
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
          className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/35 active:scale-90 transition-transform cursor-pointer border-2 border-white ring-2 ring-amber-500/20"
          aria-label="Adicionar Hábito"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'goals'
              ? 'text-amber-700 font-bold bg-amber-50/90 shadow-2xs'
              : 'text-slate-400 hover:text-slate-700 active:scale-95'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Metas</span>
        </button>

        <button
          onClick={() => setActiveTab('manifestation')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'manifestation'
              ? 'text-amber-700 font-bold bg-amber-50/90 shadow-2xs'
              : 'text-slate-400 hover:text-slate-700 active:scale-95'
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

      {/* Push Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        settings={notificationSettings}
        onUpdateSettings={setNotificationSettings}
        affirmations={affirmations}
        onShowEncouragement={showEncouragement}
        onRestoreBackup={handleRestoreBackup}
      />
    </div>
  );
};
