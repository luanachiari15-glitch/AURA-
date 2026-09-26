import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  Send,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  Upload,
} from 'lucide-react';
import { NotificationSettings, Affirmation } from '../types';
import { CONSISTENCY_PUSH_MESSAGES } from '../data/constants';
import {
  getPermissionStatus,
  requestAndSubscribePush,
  syncPushSettingsWithBackend,
  triggerTestPush,
  saveNotificationSettings,
} from '../utils/notifications';
import { exportAppData, validateAndParseBackup, AuraBackupData } from '../utils/storage';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  affirmations: Affirmation[];
  onShowEncouragement: (message: string) => void;
  onRestoreBackup?: (data: AuraBackupData['data']) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  affirmations,
  onShowEncouragement,
  onRestoreBackup,
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isActivating, setIsActivating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showSamples, setShowSamples] = useState(false);

  // Backup & Data states
  const [backupStatusMessage, setBackupStatusMessage] = useState<string | null>(null);
  const [backupStatusType, setBackupStatusType] = useState<'success' | 'error' | null>(null);
  const [pendingBackupData, setPendingBackupData] = useState<{
    data: AuraBackupData['data'];
    summary: { habitsCount: number; goalsCount: number; daysCount: number; affirmationsCount: number };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setPermission(getPermissionStatus());
      setTestResult(null);
      setBackupStatusMessage(null);
      setBackupStatusType(null);
      setPendingBackupData(null);
    }
  }, [isOpen, settings]);

  const handleExportData = () => {
    try {
      const json = exportAppData();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().substring(0, 10);
      link.href = url;
      link.download = `aura-backup-${today}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupStatusType('success');
      setBackupStatusMessage('Backup exportado com sucesso! Arquivo JSON salvo com todos os seus dados.');
      onShowEncouragement('Backup exportado com sucesso! 📁✨');
    } catch {
      setBackupStatusType('error');
      setBackupStatusMessage('Erro ao gerar o arquivo de backup.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateAndParseBackup(content);

      if (!result.success || !result.data || !result.summary) {
        setBackupStatusType('error');
        setBackupStatusMessage(result.error || 'Arquivo de backup inválido ou incompatível.');
        setPendingBackupData(null);
      } else {
        setBackupStatusType(null);
        setBackupStatusMessage(null);
        setPendingBackupData({
          data: result.data,
          summary: result.summary,
        });
      }
    };
    reader.onerror = () => {
      setBackupStatusType('error');
      setBackupStatusMessage('Falha ao ler o arquivo selecionado.');
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmRestore = () => {
    if (!pendingBackupData || !onRestoreBackup) return;

    onRestoreBackup(pendingBackupData.data);
    if (pendingBackupData.data.notificationSettings) {
      setLocalSettings(pendingBackupData.data.notificationSettings);
    }

    setBackupStatusType('success');
    setBackupStatusMessage(
      `Backup restaurado com sucesso! (${pendingBackupData.summary.habitsCount} hábitos, ${pendingBackupData.summary.goalsCount} metas, ${pendingBackupData.summary.daysCount} dias de histórico, ${pendingBackupData.summary.affirmationsCount} afirmações).`
    );
    setPendingBackupData(null);
    onShowEncouragement('Todos os seus dados foram restaurados com sucesso! ✦');
  };

  if (!isOpen) return null;

  const affirmationTexts = affirmations.map((a) => a.text);

  const handleActivatePush = async () => {
    setIsActivating(true);
    setTestResult(null);

    const updated = { ...localSettings, enabled: true };
    const res = await requestAndSubscribePush(updated, affirmationTexts);

    setIsActivating(false);
    setPermission(getPermissionStatus());

    if (res.success) {
      setLocalSettings(updated);
      onUpdateSettings(updated);
      saveNotificationSettings(updated);
      onShowEncouragement('Notificações push ativadas com sucesso no seu dispositivo! 🔔✨');
    } else {
      setTestResult(res.error || 'Não foi possível ativar as notificações.');
    }
  };

  const handleSave = async () => {
    saveNotificationSettings(localSettings);
    onUpdateSettings(localSettings);
    await syncPushSettingsWithBackend(localSettings, affirmationTexts);
    onShowEncouragement('Preferências de notificações salvas! ✦');
    onClose();
  };

  const handleSendTest = async (type: 'consistency' | 'affirmation') => {
    setIsTesting(true);
    setTestResult(null);

    const res = await triggerTestPush(type);
    setIsTesting(false);
    setTestResult(res.message);

    if (res.success) {
      onShowEncouragement('Notificação teste enviada para o seu dispositivo!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Notificações Push
              </h2>
              <p className="text-xs text-slate-400">Lembretes de constância e afirmações da Lei da Atração</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 scrollbar-none flex-1">
          {/* Permission Status Banner */}
          {permission === 'granted' ? (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 text-xs">
                <span className="font-bold text-emerald-900 block">
                  Permissão Push Ativa no Dispositivo
                </span>
                <span className="text-emerald-700">
                  Você receberá as notificações mesmo com o AURA fechado.
                </span>
              </div>
            </div>
          ) : permission === 'denied' ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-rose-800">
                <span className="font-bold block mb-0.5">Permissão Bloqueada no Navegador</span>
                <span>
                  Para receber notificações reais, clique no ícone de cadeado na barra de endereço do navegador e mude "Notificações" para "Permitir".
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-900 block text-sm">
                  Ative as Notificações no seu Celular
                </span>
                <span className="text-slate-600">
                  Receba os lembretes de constância e afirmações com o app em segundo plano.
                </span>
              </div>
              <button
                type="button"
                onClick={handleActivatePush}
                disabled={isActivating}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm shadow-amber-500/20 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isActivating ? 'Conectando...' : 'Permitir Notificações'}
              </button>
            </div>
          )}

          {testResult && (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium">
              {testResult}
            </div>
          )}

          {/* Section 1: Constancy Notifications */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 fill-orange-500/20" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    1. Notificações de Constância
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    2 lembretes diários com mensagens motivacionais variadas
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.consistencyEnabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      consistencyEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            {localSettings.consistencyEnabled && (
              <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 font-mono uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      1ª Notificação (Manhã):
                    </label>
                    <input
                      type="time"
                      value={localSettings.consistencyTime1}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          consistencyTime1: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 font-mono uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      2ª Notificação (Noite):
                    </label>
                    <input
                      type="time"
                      value={localSettings.consistencyTime2}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          consistencyTime2: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Collapsible preview of message variations */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSamples(!showSamples)}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Exemplos de mensagens rotativas ({CONSISTENCY_PUSH_MESSAGES.length} no banco)</span>
                    {showSamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showSamples && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px] text-slate-600 font-medium">
                      {CONSISTENCY_PUSH_MESSAGES.slice(0, 5).map((msg, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold shrink-0">✦</span>
                          <span>"{msg}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Affirmations Notifications */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    2. Notificações de Afirmações
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    A cada 3 horas com suas afirmações cadastradas da Lei da Atração
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.affirmationsEnabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      affirmationsEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            {localSettings.affirmationsEnabled && (
              <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between bg-purple-50/60 border border-purple-100 rounded-xl px-3 py-2 text-xs">
                  <span className="text-purple-800 font-semibold">Frequência:</span>
                  <span className="font-bold text-purple-900 font-mono">
                    A cada 3 horas (Período Ativo)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 font-mono uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      Horário de Início:
                    </label>
                    <input
                      type="time"
                      value={localSettings.affirmationsStartTime}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          affirmationsStartTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 font-mono uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      Horário de Término:
                    </label>
                    <input
                      type="time"
                      value={localSettings.affirmationsEndTime}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          affirmationsEndTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Afirmações cadastradas ativas:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {affirmations.length} {affirmations.length === 1 ? 'afirmação' : 'afirmações'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Discrete Section: Dados e backup */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Dados e backup
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Armazenamento local persistente. Exporte ou restaure seus dados a qualquer momento.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Exportar meus dados</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Importar backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Validation confirmation box before replacing data */}
            {pendingBackupData && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-2 text-xs animate-in fade-in duration-150">
                <div className="flex items-start gap-2 text-amber-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Arquivo de backup validado com sucesso!</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Contém: <strong>{pendingBackupData.summary.habitsCount}</strong> hábitos,{' '}
                  <strong>{pendingBackupData.summary.goalsCount}</strong> metas,{' '}
                  <strong>{pendingBackupData.summary.daysCount}</strong> dias de histórico e{' '}
                  <strong>{pendingBackupData.summary.affirmationsCount}</strong> afirmações.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPendingBackupData(null)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRestore}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer"
                  >
                    Confirmar e Restaurar
                  </button>
                </div>
              </div>
            )}

            {backupStatusMessage && !pendingBackupData && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium leading-relaxed animate-in fade-in duration-150 ${
                  backupStatusType === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {backupStatusMessage}
              </div>
            )}
          </div>

          {/* Test Buttons Area */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span className="text-[11px] text-slate-400">Deseja testar no seu aparelho agora?</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSendTest('consistency')}
                disabled={isTesting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>Testar Constância</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendTest('affirmation')}
                disabled={isTesting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>Testar Afirmação</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
