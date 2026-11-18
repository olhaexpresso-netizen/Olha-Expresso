import React from 'react';
import { Character, WorldState } from '../../types';
import { SYSTEMIC_OFFENSES_CATALOG } from '../../services/CrimeAndJusticeEngine';
import { BrazilHistoricalSimulationEngine } from '../../services/BrazilHistoricalSimulationEngine';
import { JusticeSimulationEngine } from '../../services/JusticeSimulationEngine';
import { Scale, ShieldAlert, Shield, Gavel, FileWarning } from 'lucide-react';


interface JusticeTabProps {
  character: Character;
  worldState: WorldState;
  onCommitOffense: (offenseId: string) => Promise<void> | void;
  onFileAppeal: (caseId: string) => Promise<void> | void;
  feedbackMessage?: string | null;
}

export const JusticeTab: React.FC<JusticeTabProps> = ({
  character,
  worldState,
  onCommitOffense,
  onFileAppeal,
  feedbackMessage,
}) => {
  const cj = worldState.crimeAndJustice;
  const justice = character.justice;
  const year = worldState.clock.year;
  const currency = worldState.brazil.currency;
  const availableOffenses = SYSTEMIC_OFFENSES_CATALOG.filter((o) => !o.minYear || year >= o.minYear);

  return (
    <div className="space-y-6">
      {feedbackMessage && (
        <div className="bg-amber-950/50 border border-amber-800/60 text-amber-100 rounded-xl px-4 py-3 text-sm">
          {feedbackMessage}
        </div>
      )}

      {/* Constitutional & Legal Ruleset */}
      {cj && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs font-medium text-sky-400">
                Ordenamento Jurídico Vigente · {cj.ruleset.constitutionName}
              </p>
              <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <Scale size={20} className="text-emerald-400" /> {cj.ruleset.eraLabel}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{cj.ruleset.notes}</p>
            </div>
            <div className="text-xs text-slate-300 tabular-nums space-y-1 md:text-right">
              <div>Teto de Pena Privativa: <strong className="text-white">{cj.ruleset.maxPrisonSentenceYears} anos</strong></div>
              <div>
                Pena de Morte em Paz: <strong>{cj.ruleset.allowsDeathPenaltyInPeacetime ? 'Prevista em lei da época' : 'Vedada Constitucionalmente'}</strong> · Prisão Perpétua: <strong>{cj.ruleset.allowsLifeImprisonment ? 'Prevista' : 'Vedada'}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs tabular-nums">
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
              <span className="text-slate-400 block">Situação Jurídica</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {character.status === 'Preso'
                  ? `Preso (${justice?.prisonRegime || 'Fechado'})`
                  : justice?.prisonRegime || 'Livre'}
              </span>
              {character.criminalRecord.prisonYearsRemaining > 0 && (
                <span className="text-amber-400">Restante: {character.criminalRecord.prisonYearsRemaining} ano(s)</span>
              )}
            </div>
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
              <span className="text-slate-400 block">Índice Nacional de Criminalidade</span>
              <span className="text-base font-bold text-amber-400 mt-0.5 block">{cj.nationalCrimeIndex}/100</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
              <span className="text-slate-400 block">Lotação Prisional</span>
              <span className="text-base font-bold text-white mt-0.5 block">{cj.prisonOccupancyPct}%</span>
            </div>
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
              <span className="text-slate-400 block">Condenações / Absolvições</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {justice?.totalConvictions ?? 0} / {justice?.totalAcquittals ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Personal Investigations & Court Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileWarning size={16} className="text-amber-400" /> Inquéritos & Ocorrências ({justice?.activeInvestigations?.length ?? 0})
          </h3>
          {!justice || justice.activeInvestigations.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum boletim de ocorrência ou inquérito policial em aberto.</p>
          ) : (
            <div className="space-y-2.5 tabular-nums">
              {justice.activeInvestigations.map((inv) => (
                <div key={inv.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{inv.offenseTitle}</span>
                    <span className="text-xs text-amber-400 font-semibold shrink-0">{inv.status.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {inv.boNumber} · {inv.investigatingForce} · Provas {inv.evidenceScore}% · Prescreve em {inv.prescribesAtYear}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Gavel size={16} className="text-sky-400" /> Processos Judiciais ({justice?.courtCases?.length ?? 0})
          </h3>
          {!justice || justice.courtCases.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum processo judicial distribuído no seu histórico.</p>
          ) : (
            <div className="space-y-3 tabular-nums">
              {justice.courtCases.map((proc) => {
                const canAppeal =
                  (proc.status === 'Condenado' || proc.status === 'Prisao_Preventiva') &&
                  proc.appealCount < 2;
                return (
                  <div key={proc.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{proc.charge}</div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {proc.processNumber} · {proc.courtLevel} · {proc.status.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          Regime: {proc.regime.replace(/_/g, ' ')} · Pena: {proc.sentenceYears} ano(s) (Cumprido: {proc.servedYears}a)
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{proc.constitutionalNote}</p>
                      </div>
                      {canAppeal && (
                        <button
                          type="button"
                          onClick={() => onFileAppeal(proc.id)}
                          className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
                        >
                          Recorrer ({proc.appealCount === 0 ? '2ª Instância' : 'STJ/STF'})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Police Forces & Criminal Organizations */}
      {cj && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield size={16} className="text-emerald-400" /> Forças de Segurança & Perícia ({cj.policeForces.length})
            </h3>
            <table className="w-full text-left border-collapse text-xs tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-3">Órgão</th>
                  <th className="py-2 pr-3">Esfera</th>
                  <th className="py-2 pr-3 text-right">Prontidão</th>
                  <th className="py-2 pr-3 text-right">Elucidação</th>
                  <th className="py-2 text-right">Confiança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cj.policeForces.map((pf) => (
                  <tr key={pf.id}>
                    <td className="py-2.5 pr-3 font-medium text-white">{pf.name} ({pf.acronym})</td>
                    <td className="py-2.5 pr-3 text-slate-400">{pf.jurisdiction}</td>
                    <td className="py-2.5 pr-3 text-right text-slate-200">{pf.readiness}%</td>
                    <td className="py-2.5 pr-3 text-right text-emerald-400">{pf.clearanceRatePct}%</td>
                    <td className="py-2.5 text-right text-slate-300">{pf.trustScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Monitoramento de Organizações Ilícitas ({cj.criminalOrganizations.length})
            </h3>
            <div className="space-y-2.5 tabular-nums">
              {cj.criminalOrganizations.map((org) => (
                <div key={org.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white">{org.name}</div>
                    <div className="text-slate-400 mt-0.5">
                      {org.type} · {org.region} · Pressão Policial {org.lawEnforcementPressure}%
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-amber-400">{org.status}</div>
                    <div className="text-slate-400">Influência {org.influence}%</div>
                  </div>
                </div>
              ))}
            </div>
            {cj.recentOperations.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                {cj.recentOperations.slice(0, 3).map((op, i) => (
                  <p key={i} className="text-xs text-slate-300">• {op}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent Legal History & NPC Tracker */}
      {worldState && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Scale size={16} className="text-sky-400" /> Histórico Jurídico Persistente & Registros do Sistema
          </h3>
          {JusticeSimulationEngine.syncPersistentLegalHistory({ character, worldState } as any).length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum registro jurídico ou inquérito persistido no radar do sistema.</p>
          ) : (
            <div className="space-y-2.5 tabular-nums max-h-72 overflow-y-auto pr-1">
              {JusticeSimulationEngine.syncPersistentLegalHistory({ character, worldState } as any).map((entry) => (
                <div key={entry.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{entry.entityName}</span>
                      <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded">{entry.entityType}</span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{entry.summary}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-emerald-400 font-semibold">{entry.year}</div>
                    <div className="text-slate-400">{entry.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Systemic Risk Actions */}
      <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert size={16} /> Simulação de Risco Ilícito & Consequências Penais
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Infrações geram boletim de ocorrência real, investigação proporcional às provas, denúncia ao Ministério Público, julgamento e cumprimento de pena conforme a Constituição de cada época.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 tabular-nums">
          {availableOffenses.map((off) => {
            const rewardFormatted = BrazilHistoricalSimulationEngine.formatMoney(off.baseRewardCentavos, currency);
            return (
              <div key={off.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm">{off.title}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{off.description}</p>
                  <p className="text-xs text-slate-300 mt-1">
                    {off.category} · Risco base {off.baseDetectionRiskPct}% · Retorno est. {rewardFormatted} · Pena base {off.baseSentenceYears}a
                  </p>
                </div>
                <button
                  type="button"
                  disabled={character.status !== 'Vivo' || character.currentAge < 14}
                  onClick={() => onCommitOffense(off.id)}
                  className="bg-rose-900/70 hover:bg-rose-800 disabled:bg-slate-800 disabled:text-slate-500 text-rose-100 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0"
                >
                  Arriscar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

