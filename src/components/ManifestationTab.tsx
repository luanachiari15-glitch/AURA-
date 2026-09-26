import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Eye,
  Heart,
  BookOpen,
  ArrowRight,
  Maximize2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Affirmation, VisionItem, DayRecord, LawOfAttractionPractices } from '../types';
import { LIFE_AREAS } from '../data/constants';
import { ConfirmModal } from './ConfirmModal';

interface ManifestationTabProps {
  dayRecord: DayRecord;
  onUpdateDayRecord: (record: Partial<DayRecord>) => void;
  affirmations: Affirmation[];
  onAddAffirmation: (text: string) => void;
  onDeleteAffirmation: (id: string) => void;
  visionItems: VisionItem[];
  onAddVisionItem: (item: Omit<VisionItem, 'id'>) => void;
  onDeleteVisionItem: (id: string) => void;
  onShowEncouragement: (message: string) => void;
}

export const ManifestationTab: React.FC<ManifestationTabProps> = ({
  dayRecord,
  onUpdateDayRecord,
  affirmations,
  onAddAffirmation,
  onDeleteAffirmation,
  visionItems,
  onAddVisionItem,
  onDeleteVisionItem,
  onShowEncouragement,
}) => {
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [isAddingAffirmation, setIsAddingAffirmation] = useState(false);

  const [isAddingVision, setIsAddingVision] = useState(false);
  const [visionTitle, setVisionTitle] = useState('');
  const [visionStatement, setVisionStatement] = useState('');
  const [visionFeeling, setVisionFeeling] = useState('');

  const [focusAffirmation, setFocusAffirmation] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'vision' | 'affirmation';
    id: string;
    title: string;
  } | null>(null);

  const practices: LawOfAttractionPractices = dayRecord.practices || {
    visualization: false,
    gratitude: false,
    affirmation: false,
    futureSelfAction: false,
    nightScripting: false,
  };

  const handleTogglePractice = (key: keyof LawOfAttractionPractices) => {
    const nextPractices = {
      ...practices,
      [key]: !practices[key],
    };

    onUpdateDayRecord({ practices: nextPractices });

    if (!practices[key]) {
      onShowEncouragement('Vibração elevada! A sua mente inconsciente está alinhada ao seu propósito.');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ea580c', '#d97706', '#059669'],
      });
    }
  };

  const handleCreateAffirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAffirmationText.trim()) return;
    onAddAffirmation(newAffirmationText.trim());
    setNewAffirmationText('');
    setIsAddingAffirmation(false);
    onShowEncouragement('Afirmação gravada com sucesso! Repita com convicção.');
  };

  const handleCreateVision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visionTitle.trim() || !visionStatement.trim()) return;

    onAddVisionItem({
      title: visionTitle.trim(),
      statement: visionStatement.trim(),
      feeling: visionFeeling.trim() || 'Certeza plena e gratidão',
      areaId: 'lei_da_atracao',
    });

    setVisionTitle('');
    setVisionStatement('');
    setVisionFeeling('');
    setIsAddingVision(false);
    onShowEncouragement('Quadro de visualização atualizado! Sinta como se já fosse realidade.');
  };

  const practicesList = [
    {
      key: 'visualization' as const,
      label: 'Visualização Sensorial do Eu de Dezembro (5 a 10 min)',
      description: 'Fechar os olhos e visualizar com riqueza de detalhes, cores e emoção você em 31 de dezembro.',
    },
    {
      key: 'gratitude' as const,
      label: 'Diário de Gratidão no Tempo Presente',
      description: 'Agradecer por 3 coisas que já existem e por 3 manifestações como se já fossem reais.',
    },
    {
      key: 'affirmation' as const,
      label: 'Declaração de Afirmações no Espelho',
      description: 'Olhar nos próprios olhos e pronunciar com postura e certeza as afirmações de identidade.',
    },
    {
      key: 'futureSelfAction' as const,
      label: 'Agir Como Minha Versão Futura Hoje',
      description: 'Tomar ao menos 1 decisão crucial hoje a partir da postura da pessoa de sucesso que você está se tornando.',
    },
    {
      key: 'nightScripting' as const,
      label: 'Scripting Noturno & Soltar o Controle',
      description: 'Escrever um parágrafo de alívio e gratidão antes de dormir, desapegando da ansiedade pelo tempo.',
    },
  ];

  const completedPracticesCount = Object.values(practices).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 text-xs text-amber-700 font-mono tracking-wider uppercase font-bold">
            <Compass className="w-4 h-4 text-amber-600" />
            <span>Alinhamento & Manifestação</span>
            <span aria-hidden="true">·</span>
            <span>Desafio 3 Meses</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 font-display">
            A Lei da Atração & O Meu Eu de Dezembro
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            "A mente não distingue o que é vivido no mundo físico do que é sentido com intensidade e certeza absoluta.
            Sinta-se já na linha de chegada de 31 de dezembro."
          </p>
        </div>
      </div>

      {/* 2. Interactive Daily Law of Attraction Checklist */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Checklist de Práticas Vibracionais de Hoje
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rituais diários para elevar a frequência e alinhar subconsciente, pensamentos e ações.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80 tabular-nums shrink-0 self-start sm:self-auto">
            {completedPracticesCount} de {practicesList.length} práticas concluídas
          </div>
        </div>

        <div className="space-y-2.5">
          {practicesList.map((item) => {
            const isDone = practices[item.key];
            return (
              <div
                key={item.key}
                onClick={() => handleTogglePractice(item.key)}
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isDone
                    ? 'border-amber-300 bg-amber-50/50 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                    isDone
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1">
                  <p
                    className={`text-sm font-bold transition-colors ${
                      isDone ? 'text-amber-900' : 'text-slate-800'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Vision Board: O Meu Eu de 31 de Dezembro */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <Eye className="w-4 h-4 text-emerald-600" />
              Quadro de Visualização: Quem Eu Serei em 31 de Dezembro
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Afirmações em primeira pessoa ancorando como você vive, sente e celebra o encerramento do desafio.
            </p>
          </div>

          <button
            onClick={() => setIsAddingVision(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Adicionar Visualização</span>
          </button>
        </div>

        {isAddingVision && (
          <form
            onSubmit={handleCreateVision}
            className="bg-white border border-amber-300 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
                Novo Pilar de Visualização
              </span>
              <button
                type="button"
                onClick={() => setIsAddingVision(false)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilar / Título *
                </label>
                <input
                  type="text"
                  value={visionTitle}
                  onChange={(e) => setVisionTitle(e.target.value)}
                  placeholder="Ex: Liberdade Financeira, Físico Esculpido, Paz Mental..."
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sensação Âncora *
                </label>
                <input
                  type="text"
                  value={visionFeeling}
                  onChange={(e) => setVisionFeeling(e.target.value)}
                  placeholder="Ex: Gratidão transbordante, leveza, autorrespeito inabalável..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Declaração no Presente ("Em 31 de Dezembro, eu...") *
              </label>
              <textarea
                value={visionStatement}
                onChange={(e) => setVisionStatement(e.target.value)}
                placeholder="Ex: Em 31 de Dezembro, celebro a conquista de manter meu corpo com vigor e olhar nos olhos dos meus familiares com imenso orgulho da minha constância..."
                rows={2}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingVision(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 shadow-xs cursor-pointer"
              >
                Salvar Visualização
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visionItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-700 tracking-wide uppercase font-mono">
                    {item.title}
                  </span>
                  <button
                    onClick={() => setDeleteTarget({ type: 'vision', id: item.id, title: item.title })}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer active:scale-90"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-slate-800 italic leading-relaxed mb-4 font-medium">
                  "{item.statement}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] text-slate-400 font-mono">Sentimento Âncora:</span>
                <span className="text-emerald-700 font-bold">{item.feeling}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Affirmations Vault & Focus Reader */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <Heart className="w-4 h-4 text-rose-500" />
              Afirmações Positivas & Reprogramação Mental
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Frases para ler em voz alta, internalizar e quebrar padrões autolimitantes.
            </p>
          </div>

          <button
            onClick={() => setIsAddingAffirmation(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nova Afirmação</span>
          </button>
        </div>

        {isAddingAffirmation && (
          <form
            onSubmit={handleCreateAffirmation}
            className="bg-white border border-amber-300 rounded-2xl p-4 space-y-3 shadow-sm animate-in fade-in duration-150"
          >
            <label className="block text-xs font-bold text-slate-700">
              Escreva sua afirmação no tempo presente (sempre positiva e em primeira pessoa):
            </label>
            <input
              type="text"
              value={newAffirmationText}
              onChange={(e) => setNewAffirmationText(e.target.value)}
              placeholder="Ex: Eu tenho a força e o foco necessários para concluir cada etapa do meu desafio..."
              required
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingAffirmation(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer shadow-xs"
              >
                Adicionar ao Cofre
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {affirmations.map((aff) => (
            <div
              key={aff.id}
              className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs group"
            >
              <div
                className="flex-1 space-y-1 cursor-pointer"
                onClick={() => setFocusAffirmation(aff.text)}
                title="Clique para abrir no Modo Foco / Meditação"
              >
                <p className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-amber-700 leading-snug transition-colors">
                  "{aff.text}"
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setFocusAffirmation(aff.text)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Modo Foco / Meditação"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ type: 'affirmation', id: aff.id, title: aff.text })}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer active:scale-90"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Big Affirmation Focus Mode Modal */}
      {focusAffirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-xl w-full bg-white border border-amber-300 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-4 sm:space-y-6 shadow-2xl relative">
            <button
              onClick={() => setFocusAffirmation(null)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-bold block">
              Repita 3 vezes com convicção e sinta em seu corpo
            </span>

            <p className="text-lg sm:text-2xl font-bold text-slate-900 font-display leading-relaxed">
              "{focusAffirmation}"
            </p>

            <button
              onClick={() => {
                setFocusAffirmation(null);
                onShowEncouragement('Afirmação ancorada! Sua vibração está elevada.');
              }}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              Eu Acredito e Eu Sinto
            </button>
          </div>
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'vision' ? 'Excluir Item de Visualização' : 'Excluir Afirmação'}
        message={
          deleteTarget?.type === 'vision'
            ? `Tem certeza que deseja remover o item "${deleteTarget?.title}" do seu quadro de visualização?`
            : `Tem certeza que deseja remover a afirmação "${deleteTarget?.title}"?`
        }
        confirmLabel="Excluir"
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'vision') {
              onDeleteVisionItem(deleteTarget.id);
              onShowEncouragement('Item de visualização removido com sucesso.');
            } else {
              onDeleteAffirmation(deleteTarget.id);
              onShowEncouragement('Afirmação removida com sucesso.');
            }
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
