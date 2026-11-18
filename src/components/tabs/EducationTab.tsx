import React from 'react';
import { Character } from '../../types';
import { WorldState } from '../../types/world';
import { SocietyEvolutionEngine } from '../../services/SocietyEvolutionEngine';
import { BrazilHistoricalSimulationEngine } from '../../services/BrazilHistoricalSimulationEngine';
import { GraduationCap, BookOpen } from 'lucide-react';

interface EducationTabProps {
  character: Character;
  worldState?: WorldState;
  onEnrollEducation: (educationName: string, programId?: string) => void;
}

export const EducationTab: React.FC<EducationTabProps> = ({ character, worldState, onEnrollEducation }) => {
  const currentYear = worldState?.clock.year ?? (character.birthYear + character.currentAge);
  const programs = SocietyEvolutionEngine.getAvailableEducationPrograms(currentYear, worldState);

  const ageMinMap: Record<string, number> = {
    edu_basico: 6,
    edu_medio: 14,
    edu_direito: 18,
    edu_medicina: 18,
    edu_engenharia: 18,
    edu_economia: 18,
    edu_computacao: 18,
    edu_tecnologo_ia: 22,
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <GraduationCap size={18} className="text-emerald-400" /> Situação Educacional ({currentYear})
          </h3>
          {worldState && (
            <span className="text-xs text-slate-400 tabular-nums">
              Alfabetização Brasil: <strong className="text-emerald-400">{worldState.brazil.literacyRate}%</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Nível Concluído</span>
            <span className="text-lg font-bold text-white">{character.educationLevel}</span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Curso em Andamento</span>
            <span className="text-lg font-bold text-emerald-400">{character.currentEducation || 'Nenhum curso ativo'}</span>
            {character.currentEducation && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1 tabular-nums">
                  <span>Progresso</span>
                  <span>{character.educationProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${character.educationProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Programas Educacionais Disponíveis em {currentYear}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {programs.map((prog) => {
            const minAge = ageMinMap[prog.id] ?? 18;
            const canAfford = character.money >= prog.costCentavos;
            const canEnroll = character.currentAge >= minAge && !character.currentEducation && canAfford;
            const costStr =
              prog.costCentavos === 0
                ? 'Gratuito'
                : BrazilHistoricalSimulationEngine.formatMoney(prog.costCentavos, worldState?.brazil.currency);

            return (
              <div key={prog.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <BookOpen size={16} className="text-sky-400 shrink-0" /> {prog.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 tabular-nums">
                    Idade mín.: {minAge} anos · Duração: ~{prog.durationYears} anos · Custo: <strong className="text-slate-200">{costStr}</strong>
                  </p>
                </div>
                <button
                  disabled={!canEnroll}
                  onClick={() => onEnrollEducation(prog.name, prog.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    canEnroll
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {canEnroll ? 'Matricular-se' : !canAfford ? 'Saldo insuf.' : 'Indisponível'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
