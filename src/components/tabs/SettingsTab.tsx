import React, { useState } from 'react';
import { UserPreferences } from '../../types';
import { Settings, Trash2, Home, Sliders } from 'lucide-react';

interface SettingsTabProps {
  preferences?: UserPreferences;
  onUpdatePreferences?: (prefs: UserPreferences) => void;
  onReturnHome: () => void;
  onDeleteGame: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  preferences = { autoOpenEvents: true, compactTimeline: false, confirmRiskyActions: true },
  onUpdatePreferences,
  onReturnHome,
  onDeleteGame,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const togglePref = (key: keyof UserPreferences) => {
    if (!onUpdatePreferences) return;
    onUpdatePreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Settings size={20} className="text-emerald-400" /> Configurações da Partida
      </h2>

      {onUpdatePreferences && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders size={14} className="text-emerald-400" /> Preferências do Jogador
          </h3>

          <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
            <div>
              <span className="text-sm font-medium text-white block">Abrir eventos interativos automaticamente</span>
              <span className="text-xs text-slate-400">Exibe modal imediato ao surgir nova escolha de vida.</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoOpenEvents}
              onChange={() => togglePref('autoOpenEvents')}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer py-1 border-t border-slate-800 pt-3">
            <div>
              <span className="text-sm font-medium text-white block">Linha do tempo compacta</span>
              <span className="text-xs text-slate-400">Otimiza o histórico para exibição resumida.</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.compactTimeline}
              onChange={() => togglePref('compactTimeline')}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer py-1 border-t border-slate-800 pt-3">
            <div>
              <span className="text-sm font-medium text-white block">Confirmar ações irreversíveis</span>
              <span className="text-xs text-slate-400">Exige confirmação dupla para divórcios ou exclusões.</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.confirmRiskyActions}
              onChange={() => togglePref('confirmRiskyActions')}
              className="w-4 h-4 accent-emerald-500"
            />
          </label>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-slate-800">
          <div>
            <h4 className="font-semibold text-white text-sm">Voltar ao Menu Principal</h4>
            <p className="text-xs text-slate-400">Salva o progresso atual e retorna à tela inicial.</p>
          </div>
          <button
            onClick={onReturnHome}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
          >
            <Home size={14} /> Menu
          </button>
        </div>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-rose-400 text-sm">Excluir Partida Atual</h4>
              <p className="text-xs text-slate-400">Esta ação é irreversível e apagará todo o progresso.</p>
            </div>
            {!confirmingDelete ? (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 px-4 py-2 rounded-xl text-xs font-semibold transition border border-rose-800 flex items-center gap-1.5 shadow"
              >
                <Trash2 size={14} /> Excluir
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={onDeleteGame}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow"
                >
                  Confirmar Exclusão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
