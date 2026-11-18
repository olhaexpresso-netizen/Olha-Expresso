import React, { useState } from 'react';
import { Character, Asset } from '../../types';
import { WorldState } from '../../types/world';
import { GlobalEconomicSimulationEngine } from '../../services/GlobalEconomicSimulationEngine';
import { WorldTechnologyEngine } from '../../services/WorldTechnologyEngine';
import { BrazilHistoricalSimulationEngine } from '../../services/BrazilHistoricalSimulationEngine';
import {
  DollarSign,
  ShieldAlert,
  Home,
  Car,
  TrendingUp,
  HeartPulse,
  MapPin,
  Syringe,
  Building2,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

interface FinancesTabProps {
  character: Character;
  assets: Asset[];
  worldState?: WorldState;
  onBuyAsset: (catalogId: string) => void;
  onSellAsset?: (assetId: string) => void;
  onMoveCity?: (cityId: string) => void;
  onManageSavings?: (amountCentavos: number, action: 'deposit' | 'withdraw') => void;
  onTakeLoan?: (principalCentavos: number, months: number, purpose: string) => void;
  onSettleLoan?: (loanId?: string) => void;
  onToggleInsurance?: (type: 'health' | 'life') => void;
  onTreatHealth?: (treatmentId: string) => void;
  onVaccinate?: () => void;
  onOpenJustice?: () => void;
  bankingFeedback?: string | null;
}

export const FinancesTab: React.FC<FinancesTabProps> = ({
  character,
  assets,
  worldState,
  onBuyAsset,
  onSellAsset,
  onMoveCity,
  onManageSavings,
  onTakeLoan,
  onSettleLoan,
  onToggleInsurance,
  onTreatHealth,
  onVaccinate,
  onOpenJustice,
  bankingFeedback,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [savingsAmountBRL, setSavingsAmountBRL] = useState<string>('1000');
  const [loanAmountBRL, setLoanAmountBRL] = useState<string>('5000');
  const [loanMonths, setLoanMonths] = useState<number>(24);
  const [loanPurpose, setLoanPurpose] = useState<string>('Capital Pessoal & Reforma');

  const currency = worldState?.brazil.currency;
  const formattedMoney = BrazilHistoricalSimulationEngine.formatMoney(character.money, currency);
  const currentYear = worldState?.clock.year ?? (character.birthYear + character.currentAge);
  const annualLivingCost = worldState
    ? GlobalEconomicSimulationEngine.calculateAnnualLivingCostCentavos(worldState, character.currentAge, character.city)
    : 1200000;

  const marketAssets = worldState
    ? GlobalEconomicSimulationEngine.getAssetCatalog(worldState, character.city)
    : [];

  const treatments = WorldTechnologyEngine.getAvailableMedicalTreatments(currentYear).map((t) => ({
    ...t,
    costCentavos: worldState
      ? Math.round(t.costCentavos * Math.max(0.45, Math.min(2500, worldState.economy.costOfLivingMultiplier)))
      : t.costCentavos,
  }));

  const otherCities = worldState
    ? Object.values(worldState.brazil.cities)
        .filter((c) => c.name !== character.city)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const banking = character.banking;

  return (
    <div className="space-y-6">
      {bankingFeedback && (
        <div className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 rounded-xl px-4 py-3 text-sm">
          {bankingFeedback}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Saldo em Conta Corrente</span>
          <h2 className="text-3xl font-extrabold text-emerald-400 tabular-nums">{formattedMoney}</h2>
          {worldState && (
            <p className="text-xs text-slate-400 mt-1 tabular-nums">
              Custo anual em {character.city}:{' '}
              <strong className="text-slate-200">
                {BrazilHistoricalSimulationEngine.formatMoney(annualLivingCost, currency)}
              </strong>{' '}
              · Imposto efetivo: {worldState.brazil.baseTaxRatePct}% · Selic {worldState.brazil.selicRate}%
            </p>
          )}
        </div>
        <div className="bg-emerald-950/60 border border-emerald-800/60 p-3 rounded-xl text-emerald-300 self-start sm:self-center">
          <DollarSign size={28} />
        </div>
      </div>

      {/* Banking, Savings (Selic), Credit Score & Loans */}
      {banking && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Landmark size={16} className="text-emerald-400" /> Banco, Reserva Selic, Crédito & Seguros
            </h3>
            <div className="text-xs text-slate-300 tabular-nums flex flex-wrap items-center gap-3">
              <span>Score: <strong className="text-emerald-400">{banking.creditScore}/1000</strong></span>
              <span aria-hidden="true">·</span>
              <span>Impostos pagos: <strong>{BrazilHistoricalSimulationEngine.formatMoney(banking.totalTaxesPaidCentavos, currency)}</strong></span>
              {banking.inDefault && <span className="text-rose-400 font-semibold">· Inadimplente</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 tabular-nums">
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Reserva / Poupança (Rende Selic)</span>
                <span className="text-base font-bold text-emerald-400">
                  {BrazilHistoricalSimulationEngine.formatMoney(banking.savingsCentavos, currency)}
                </span>
              </div>
              {onManageSavings && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    aria-label="Valor em reais para poupança"
                    value={savingsAmountBRL}
                    onChange={(e) => setSavingsAmountBRL(e.target.value)}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => onManageSavings(Math.round(Math.max(1, Number(savingsAmountBRL)) * 100), 'deposit')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap"
                  >
                    Depositar
                  </button>
                  <button
                    type="button"
                    onClick={() => onManageSavings(Math.round(Math.max(1, Number(savingsAmountBRL)) * 100), 'withdraw')}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap"
                  >
                    Resgatar
                  </button>
                </div>
              )}

              {onToggleInsurance && (
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-sky-400" /> Seguros Ativos
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleInsurance('health')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        character.insurance?.health
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      Saúde: {character.insurance?.health ? 'Ativo' : 'Contratar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleInsurance('life')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        character.insurance?.life
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      Vida: {character.insurance?.life ? 'Ativo' : 'Contratar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Linha de Crédito & Empréstimos ({banking.loans.length} ativo(s))</span>
                <span className="text-xs text-slate-300">
                  Taxa ref.: {(worldState?.brazil.selicRate ?? 10.5) + 4}% a.a.
                </span>
              </div>
              {onTakeLoan && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={100}
                    aria-label="Valor do empréstimo"
                    value={loanAmountBRL}
                    onChange={(e) => setLoanAmountBRL(e.target.value)}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <select
                    aria-label="Prazo do empréstimo"
                    value={loanMonths}
                    onChange={(e) => setLoanMonths(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value={12}>12x</option>
                    <option value={24}>24x</option>
                    <option value={36}>36x</option>
                    <option value={48}>48x</option>
                  </select>
                  <input
                    type="text"
                    aria-label="Finalidade"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    className="flex-1 min-w-[120px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    disabled={character.currentAge < 18}
                    onClick={() => onTakeLoan(Math.round(Math.max(100, Number(loanAmountBRL)) * 100), loanMonths, loanPurpose)}
                    className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap"
                  >
                    Contratar
                  </button>
                </div>
              )}

              {banking.loans.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  {banking.loans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-slate-300 truncate">
                        {loan.purpose} · Restam {loan.remainingMonths}x de{' '}
                        {BrazilHistoricalSimulationEngine.formatMoney(loan.monthlyInstallmentCentavos, currency)}
                      </span>
                      {onSettleLoan && (
                        <button
                          type="button"
                          onClick={() => onSettleLoan(loan.id)}
                          className="bg-amber-700 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0"
                        >
                          Quitar ({BrazilHistoricalSimulationEngine.formatMoney(loan.remainingCentavos, currency)})
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* City migration */}
      {onMoveCity && otherCities.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin size={15} className="text-sky-400" /> Moradia Atual: {character.city}, {character.state} ({character.housingStatus || 'Mora com pais'})
            </h3>
            <p className="text-xs text-slate-400">Migrar para outra UF ou metrópole altera oportunidades de emprego e custo de vida.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Cidade de destino"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">Escolher destino...</option>
              {otherCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.ufCode}) — Custo {c.costOfLivingIndex}
                </option>
              ))}
            </select>
            <button
              disabled={!selectedCityId}
              onClick={() => {
                if (selectedCityId) {
                  onMoveCity(selectedCityId);
                  setSelectedCityId('');
                }
              }}
              className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap"
            >
              Mudar de Cidade
            </button>
          </div>
        </div>
      )}

      {/* Owned Assets */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Seu Patrimônio ({assets.length})
        </h3>
        {assets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
            Você ainda não possui imóveis, veículos ou investimentos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map((asset) => {
              const valFormatted = BrazilHistoricalSimulationEngine.formatMoney(asset.value, currency);
              return (
                <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      {asset.type === 'Imóvel' ? (
                        <Home size={16} className="text-emerald-400" />
                      ) : asset.type === 'Investimento' ? (
                        <TrendingUp size={16} className="text-amber-400" />
                      ) : asset.type === 'Empresa' ? (
                        <Building2 size={16} className="text-purple-400" />
                      ) : (
                        <Car size={16} className="text-sky-400" />
                      )}
                      {asset.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 tabular-nums">
                      Adquirido em {asset.purchaseYear}
                      {asset.monthlyIncome > 0
                        ? ` · Renda/mês: ${BrazilHistoricalSimulationEngine.formatMoney(asset.monthlyIncome, currency)}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 tabular-nums">
                    <span className="text-sm font-bold text-white">{valFormatted}</span>
                    {onSellAsset && (
                      <button
                        onClick={() => onSellAsset(asset.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition"
                      >
                        Vender
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Market Catalog */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Mercado de Patrimônio & Investimentos ({currentYear})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {marketAssets.map((item) => {
            const priceFormatted = BrazilHistoricalSimulationEngine.formatMoney(item.priceCentavos, currency);
            const incomeFormatted = BrazilHistoricalSimulationEngine.formatMoney(item.monthlyIncomeCentavos, currency);
            const canAfford = character.money >= item.priceCentavos;

            return (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-base">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 tabular-nums">
                    {item.type} · Preço: <span className="text-emerald-400 font-semibold">{priceFormatted}</span>
                    {item.monthlyIncomeCentavos > 0 ? ` · Renda/mês: ${incomeFormatted}` : ''}
                  </p>
                </div>
                <button
                  disabled={!canAfford}
                  onClick={() => onBuyAsset(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition shadow whitespace-nowrap shrink-0 ${
                    canAfford
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Comprar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medical & Vaccination */}
      {onTreatHealth && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <HeartPulse size={16} className="text-rose-400" /> Saúde & Medicina Disponível em {currentYear}
            </h3>
            {onVaccinate && currentYear >= 1920 && (
              <button
                onClick={onVaccinate}
                className="bg-teal-700 hover:bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Syringe size={13} /> Vacinar-se ({currentYear})
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {treatments.map((tr) => {
              const costFormatted = BrazilHistoricalSimulationEngine.formatMoney(tr.costCentavos, currency);
              return (
                <div key={tr.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">{tr.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                      Custo: {costFormatted} · Recuperação: +{tr.healthBoost} Saúde
                    </p>
                  </div>
                  <button
                    onClick={() => onTreatHealth(tr.id)}
                    className="bg-rose-700 hover:bg-rose-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0"
                  >
                    Realizar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Link to Full Systemic Justice & Security */}
      {onOpenJustice && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-400" /> Sistema Penal, Processos & Segurança Pública
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhe inquéritos policiais, forças de segurança, recursos judiciais e simulação de infrações na aba Justiça.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenJustice}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap"
          >
            Abrir Justiça & Segurança
          </button>
        </div>
      )}
    </div>
  );
};

