import React, { useState } from 'react';
import { BusinessSector, Character } from '../../types';
import { WorldState } from '../../types/world';
import { GlobalBusinessEvolutionEngine } from '../../services/GlobalBusinessEvolutionEngine';
import { BrazilHistoricalSimulationEngine } from '../../services/BrazilHistoricalSimulationEngine';
import { Briefcase, Building2, TrendingUp, LogOut, Rocket } from 'lucide-react';

interface CareerTabProps {
  character: Character;
  worldState?: WorldState;
  onApplyCareer: (roleId: string) => void;
  onPromote?: () => void;
  onResign?: () => void;
  onFoundCompany?: (companyName: string, sector: BusinessSector) => void;
}

export const CareerTab: React.FC<CareerTabProps> = ({
  character,
  worldState,
  onApplyCareer,
  onPromote,
  onResign,
  onFoundCompany,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState<BusinessSector>('Comércio');
  const [trackFilter, setTrackFilter] = useState<string>('Todas');

  const formattedSalary = BrazilHistoricalSimulationEngine.formatMoney(
    character.salary,
    worldState?.brazil.currency
  );
  const currentYear = worldState?.clock.year ?? (character.birthYear + character.currentAge);

  const dynamicJobs = worldState
    ? GlobalBusinessEvolutionEngine.getAvailableJobs(
        worldState,
        character.currentAge,
        character.educationLevel,
        character.city
      )
    : [];

  const availableTracks = Array.from(new Set(dynamicJobs.map((j) => j.careerTrack || 'Formal')));
  const filteredJobs =
    trackFilter === 'Todas'
      ? dynamicJobs
      : dynamicJobs.filter((j) => (j.careerTrack || 'Formal') === trackFilter);

  const handleFoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onFoundCompany || !companyName.trim()) return;
    onFoundCompany(companyName.trim(), sector);
    setCompanyName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Briefcase size={16} className="text-emerald-400" /> Emprego Atual ({currentYear})
          </h3>
          {worldState && (
            <span className="text-xs text-slate-400 tabular-nums">
              Desemprego Brasil: <strong className="text-slate-200">{worldState.brazil.unemploymentRate}%</strong> · Ciclo: <strong className="text-emerald-400">{worldState.economy.cyclePhase}</strong>
            </span>
          )}
        </div>
        {character.careerTitle ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h4 className="text-lg font-bold text-white">{character.careerTitle}</h4>
              <p className="text-sm text-slate-300 flex items-center gap-1.5 mt-1">
                <Building2 size={14} className="text-slate-400" /> {character.careerCompany}
              </p>
              <p className="text-xs text-slate-400 mt-1 tabular-nums">
                Experiência: {character.careerExperienceYears} ano(s) · Habilidade: {character.careerSkill}%
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2 tabular-nums">
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Salário Anual Bruto</span>
                <span className="text-lg font-bold text-emerald-400">{formattedSalary}</span>
              </div>
              <div className="flex items-center gap-2">
                {onPromote && (
                  <button
                    onClick={onPromote}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <TrendingUp size={13} /> Pedir Promoção
                  </button>
                )}
                {onResign && (
                  <button
                    onClick={onResign}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <LogOut size={13} /> Pedir Demissão
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 text-slate-400 text-sm">
            Você está sem vínculo profissional no momento. Veja as vagas compatíveis com a época ({currentYear}) e sua cidade ({character.city}).
          </div>
        )}
      </div>

      {/* Entrepreneurship */}
      {onFoundCompany && character.currentAge >= 21 && (
        <form onSubmit={handleFoundSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Rocket size={16} className="text-sky-400" /> Empreender: Fundar Própria Empresa
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome da sua empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <select
              aria-label="Setor da empresa"
              value={sector}
              onChange={(e) => setSector(e.target.value as BusinessSector)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Comércio">Comércio</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Indústria">Indústria</option>
              <option value="Agropecuária">Agropecuária</option>
              <option value="Saúde">Saúde</option>
              <option value="Educação">Educação</option>
              <option value="Finanças">Finanças</option>
            </select>
            <button
              type="submit"
              disabled={!companyName.trim()}
              className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap"
            >
              Fundar Empresa
            </button>
          </div>
        </form>
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Mercado de Trabalho em {character.city} ({currentYear}) — {filteredJobs.length} vagas
          </h3>
          {availableTracks.length > 0 && (
            <select
              aria-label="Filtrar trilha de carreira"
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="Todas">Todas as Trilhas ({dynamicJobs.length})</option>
              {availableTracks.map((tr) => (
                <option key={tr} value={tr}>
                  {tr}
                </option>
              ))}
            </select>
          )}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-slate-400">
            Nenhuma vaga compatível para os filtros atuais em {character.city}. Avance o tempo ou conclua seus estudos.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const eduRank: Record<string, number> = {
                Nenhum: 0,
                Fundamental: 1,
                Médio: 2,
                Universidade: 3,
                'Pós-graduação': 4,
              };
              const hasEdu = (eduRank[character.educationLevel] ?? 0) >= (eduRank[job.minEducation] ?? 0);
              const hasInt = !job.requiredIntelligence || character.intelligence >= job.requiredIntelligence;
              const canApply = character.currentAge >= job.minAge && hasEdu && hasInt;
              const salaryFormatted = BrazilHistoricalSimulationEngine.formatMoney(
                job.baseAnnualSalaryCentavos,
                worldState?.brazil.currency
              );

              return (
                <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-base">{job.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {job.careerTrack || 'Formal'} · {job.companyName} · Setor {job.sector} · {job.minAge}+ anos / {job.minEducation}
                      {job.requiredIntelligence ? ` / Int ${job.requiredIntelligence}+` : ''}
                      {job.isExtinct ? ' · Ocupação histórica' : ''}
                      {job.legalRiskPct ? ` · Risco ocupacional ${job.legalRiskPct}%` : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 tabular-nums">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Salário Anual</span>
                      <span className="text-sm font-bold text-emerald-400">{salaryFormatted}</span>
                    </div>
                    <button
                      disabled={!canApply}
                      onClick={() => onApplyCareer(job.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                        canApply
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canApply
                        ? 'Candidatar-se'
                        : !hasEdu
                          ? `Requer ${job.minEducation}`
                          : !hasInt
                            ? `Requer Int ${job.requiredIntelligence}+`
                            : `Requer ${job.minAge}+ anos`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
