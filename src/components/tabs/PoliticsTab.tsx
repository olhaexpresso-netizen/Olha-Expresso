import React, { useEffect, useState } from 'react';
import {
  Character,
  GovernmentAdministrationState,
  PoliticalOfficeTitle,
  WorldState,
} from '../../types';
import {
  POLITICAL_OFFICES_CATALOG,
  POLITICAL_PARTIES,
  PUBLIC_POLICY_PROGRAMS,
} from '../../services/GovernanceAndPoliticsEngine';
import { BrazilHistoricalSimulationEngine } from '../../services/BrazilHistoricalSimulationEngine';
import { Landmark, Vote, ShieldCheck, Sliders, Award, CheckSquare } from 'lucide-react';

interface PoliticsTabProps {
  character: Character;
  worldState: WorldState;
  onCivicAction: (action: 'vote' | 'debate' | 'volunteer') => Promise<void> | void;
  onRunForOffice: (office: PoliticalOfficeTitle, partyName: string) => Promise<void> | void;
  onGovernPolicy: (payload: {
    taxRatePct?: number;
    budgets?: Partial<GovernmentAdministrationState['budgets']>;
    toggleProgramId?: string;
    runCorruptionAudit?: boolean;
  }) => Promise<void> | void;
  feedbackMessage?: string | null;
}

const BUDGET_LABELS: { key: keyof GovernmentAdministrationState['budgets']; label: string }[] = [
  { key: 'health', label: 'Saúde & SUS' },
  { key: 'education', label: 'Educação & Escolas' },
  { key: 'security', label: 'Segurança Pública' },
  { key: 'infrastructure', label: 'Infraestrutura & Energia' },
  { key: 'science', label: 'Ciência & Inovação' },
  { key: 'environment', label: 'Meio Ambiente' },
  { key: 'socialPrograms', label: 'Programas Sociais' },
];

export const PoliticsTab: React.FC<PoliticsTabProps> = ({
  character,
  worldState,
  onCivicAction,
  onRunForOffice,
  onGovernPolicy,
  feedbackMessage,
}) => {
  const admin = worldState.governmentAdmin;
  const politics = character.politics;
  const year = worldState.clock.year;
  const currency = worldState.brazil.currency;

  const [selectedParty, setSelectedParty] = useState<string>(
    politics?.party || POLITICAL_PARTIES[0].name
  );
  const [draftTaxRate, setDraftTaxRate] = useState<number>(admin?.taxRatePct ?? worldState.brazil.baseTaxRatePct);
  const [draftBudgets, setDraftBudgets] = useState<GovernmentAdministrationState['budgets']>(
    admin?.budgets ?? {
      health: 18,
      education: 20,
      security: 15,
      infrastructure: 16,
      science: 7,
      environment: 6,
      socialPrograms: 18,
    }
  );

  useEffect(() => {
    if (admin) {
      setDraftTaxRate(admin.taxRatePct);
      setDraftBudgets(admin.budgets);
    }
  }, [admin?.taxRatePct, admin?.activeOfficeTitle, admin?.budgets]);

  const availableOffices = POLITICAL_OFFICES_CATALOG.filter((o) => !o.minYear || year >= o.minYear);
  const costScale = Math.max(0.4, Math.min(50, worldState.economy.costOfLivingMultiplier || 1));

  return (
    <div className="space-y-6">
      {feedbackMessage && (
        <div className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 rounded-xl px-4 py-3 text-sm">
          {feedbackMessage}
        </div>
      )}

      {/* Mandate & Regime Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-400">
              {worldState.brazil.politicalRegimeType} · {worldState.brazil.constitution}
            </p>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <Landmark size={20} className="text-emerald-400" />
              {politics && politics.office !== 'Nenhum'
                ? `Mandato Ativo: ${politics.office}`
                : 'Vida Política & Administração Pública'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Governo Nacional: {worldState.brazil.currentGovernment.leaderName} ({worldState.brazil.currentGovernment.title}) · Aprovação Popular: {worldState.politics.citizenParticipationScore}/100
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onCivicAction('vote')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Vote size={14} /> Votar
            </button>
            <button
              type="button"
              onClick={() => onCivicAction('debate')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0"
            >
              Debate Público
            </button>
            <button
              type="button"
              onClick={() => onCivicAction('volunteer')}
              className="bg-sky-700 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0"
            >
              Voluntariado
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs tabular-nums">
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-400 block">Cargo Atual</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {politics?.office || 'Cidadão'}
            </span>
            {politics?.mandateYearsRemaining ? (
              <span className="text-slate-400">{politics.mandateYearsRemaining} ano(s) restantes</span>
            ) : null}
          </div>
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-400 block">Reputação & Carisma</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              {character.reputation}% / {character.charisma}%
            </span>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-400 block">Aprovação do Mandato</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {admin?.publicSatisfaction ?? politics?.approvalRating ?? 50}%
            </span>
          </div>
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-400 block">Integridade / Auditoria</span>
            <span className="text-base font-bold text-sky-400 mt-0.5 block">
              {admin?.corruptionAuditScore ?? 68}/100
            </span>
          </div>
        </div>
      </div>

      {/* Playable Government Administration Mode */}
      {admin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-emerald-400" />
                Painel de Gestão Pública ({admin.scope})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {admin.playerControlled
                  ? 'Você está no exercício direto do mandato executivo/legislativo e define as prioridades orçamentárias.'
                  : 'Conquiste um cargo político abaixo para assumir o comando direto da carga tributária, ministérios e programas.'}
              </p>
            </div>
            <div className="text-xs text-slate-300 tabular-nums">
              Saldo Fiscal: <strong className={admin.fiscalBalancePctGdp >= 0 ? 'text-emerald-400' : 'text-amber-400'}>{admin.fiscalBalancePctGdp}% PIB</strong> · Alíquota Base: <strong>{admin.taxRatePct}%</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="tax-slider" className="font-semibold text-slate-200">
                  Carga Tributária Efetiva (%)
                </label>
                <span className="font-mono tabular-nums text-emerald-400 font-bold">{draftTaxRate}%</span>
              </div>
              <input
                id="tax-slider"
                type="range"
                min={10}
                max={48}
                step={1}
                disabled={!admin.playerControlled}
                value={draftTaxRate}
                onChange={(e) => setDraftTaxRate(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />

              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Alocação Orçamentária por Área (normalizada automaticamente para 100%)
                </span>
                {BUDGET_LABELS.map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-mono tabular-nums text-white">{draftBudgets[item.key]}%</span>
                    </div>
                    <input
                      type="range"
                      aria-label={item.label}
                      min={2}
                      max={45}
                      step={1}
                      disabled={!admin.playerControlled}
                      value={draftBudgets[item.key]}
                      onChange={(e) =>
                        setDraftBudgets((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                      }
                      className="w-full accent-sky-500"
                    />
                  </div>
                ))}
              </div>

              {admin.playerControlled && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onGovernPolicy({ taxRatePct: draftTaxRate, budgets: draftBudgets })}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0"
                  >
                    Aplicar Orçamento & Impostos
                  </button>
                  <button
                    type="button"
                    onClick={() => onGovernPolicy({ runCorruptionAudit: true })}
                    className="bg-sky-700 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck size={14} /> Auditoria Anticorrupção
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">
                Programas Estratégicos de Governo
              </span>
              <div className="space-y-2">
                {PUBLIC_POLICY_PROGRAMS.map((prog) => {
                  const active = admin.activePrograms.includes(prog.id);
                  return (
                    <div
                      key={prog.id}
                      className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{prog.name}</div>
                        <div className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                          Custo fiscal {prog.costBudgetPct}% · Aprovação +{prog.approvalBoost}%
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!admin.playerControlled}
                        onClick={() => onGovernPolicy({ toggleProgramId: prog.id })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 flex items-center gap-1 ${
                          active
                            ? 'bg-emerald-600 text-white'
                            : admin.playerControlled
                              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <CheckSquare size={12} /> {active ? 'Ativo' : 'Ativar'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {admin.recentDecisions.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 block">Atos Recentes</span>
                  {admin.recentDecisions.slice(0, 4).map((dec, idx) => (
                    <p key={idx} className="text-xs text-slate-300">
                      • {dec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Electoral Candidacy */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" /> Disputar Eleições & Carreira Política
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Escolha uma legenda partidária e dispute mandatos municipais, estaduais ou federais.
            </p>
          </div>
          <select
            aria-label="Partido Político"
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            {POLITICAL_PARTIES.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} ({p.ideology})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 tabular-nums">
          {availableOffices.map((spec) => {
            const campaignCost = Math.round(spec.campaignCostCentavos * costScale);
            const salaryFormatted = BrazilHistoricalSimulationEngine.formatMoney(
              Math.round(spec.annualSalaryCentavos * costScale),
              currency
            );
            const costFormatted = BrazilHistoricalSimulationEngine.formatMoney(campaignCost, currency);
            const regimeBlocked = !worldState.brazil.canVoteDirectly && spec.scope === 'Federal';
            const canRun =
              character.status === 'Vivo' &&
              character.currentAge >= spec.minAge &&
              character.reputation >= spec.minReputation &&
              character.money >= campaignCost &&
              !regimeBlocked;

            return (
              <div
                key={spec.office}
                className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm">
                    {spec.office} · {spec.scope}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Idade {spec.minAge}+ · Rep. {spec.minReputation}% · Mandato {spec.termYears} anos
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Campanha: <span className="text-amber-300">{costFormatted}</span> · Subsídio: <span className="text-emerald-400">{salaryFormatted}/ano</span>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!canRun}
                  onClick={() => onRunForOffice(spec.office, selectedParty)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    canRun
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {regimeBlocked
                    ? 'Suspenso'
                    : character.currentAge < spec.minAge
                      ? `${spec.minAge}+ anos`
                      : character.reputation < spec.minReputation
                        ? `Rep ${spec.minReputation}%`
                        : character.money < campaignCost
                          ? 'Sem verba'
                          : 'Candidatar-se'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
