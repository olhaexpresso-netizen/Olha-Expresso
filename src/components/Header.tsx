import React from 'react';
import { Character } from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import { AdvancedLifecycleVisualEngine } from '../services/AdvancedLifecycleVisualEngine';
import { WorldClockEngine } from '../services/WorldClockEngine';
import { BrazilHistoricalSimulationEngine } from '../services/BrazilHistoricalSimulationEngine';
import { WorldState } from '../types/world';
import { Heart, Smile, Brain, Sparkles, DollarSign, Calendar, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  character: Character;
  worldState?: WorldState;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ character, worldState, onOpenSettings, onOpenHistory }) => {
  const currentYear = worldState?.clock.year ?? (character.birthYear + character.currentAge);
  const dateDisplay = worldState ? WorldClockEngine.formatDateBR(worldState.clock) : `${currentYear}`;
  const ageMonths = character.ageMonths ?? character.currentAge * 12;
  const stageLabel = AdvancedLifecycleVisualEngine.getStageLabel(
    AdvancedLifecycleVisualEngine.resolveAgeStage(ageMonths)
  );
  const formattedMoney = BrazilHistoricalSimulationEngine.formatMoney(
    character.money,
    worldState?.brazil.currency
  );

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CharacterAvatar character={character} ageMonths={ageMonths} size="sm" showAgeBadge={true} />
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              {character.firstName} {character.lastName}
              {character.status === 'Preso' && (
                <span className="bg-amber-600 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-normal">
                  <ShieldAlert size={12} /> Preso ({character.criminalRecord.prisonYearsRemaining} anos)
                </span>
              )}
              {character.generation > 1 && (
                <span className="text-xs text-emerald-400 font-semibold">
                  · {character.generation}ª Geração
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2 tabular-nums">
              <span>{AdvancedLifecycleVisualEngine.formatAgeDisplay(ageMonths)} · {stageLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-slate-200 font-medium">
                <Calendar size={12} /> {dateDisplay}
                {worldState?.clock.season ? ` (${worldState.clock.season})` : ''}
              </span>
              <span aria-hidden="true">·</span>
              <span>{character.city}, {character.state}</span>
              {worldState && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">{worldState.brazil.phaseLabel}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 tabular-nums">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-base sm:text-lg">
            <DollarSign size={18} />
            <span>{formattedMoney}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1" title="Saúde">
              <Heart size={14} className="text-rose-500" />
              <span>{character.health}%</span>
            </div>
            <div className="flex items-center gap-1" title="Felicidade">
              <Smile size={14} className="text-amber-400" />
              <span>{character.happiness}%</span>
            </div>
            <div className="flex items-center gap-1" title="Inteligência">
              <Brain size={14} className="text-sky-400" />
              <span>{character.intelligence}%</span>
            </div>
            <div className="flex items-center gap-1" title="Aparência">
              <Sparkles size={14} className="text-purple-400" />
              <span>{character.looks}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            Histórico
          </button>
          <button
            onClick={onOpenSettings}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            Ajustes
          </button>
        </div>
      </div>
    </header>
  );
};
