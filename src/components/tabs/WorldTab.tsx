import React, { useState } from 'react';
import { formatTruthStatusLabel, WorldState } from '../../types/world';
import { WorldClockEngine } from '../../services/WorldClockEngine';
import { WorldTechnologyEngine } from '../../services/WorldTechnologyEngine';
import { BrazilHistoricalSimulationEngine } from '../../services/BrazilHistoricalSimulationEngine';
import {
  Globe,
  Landmark,
  Flag,
  Clock,
  Cpu,
  Building2,
  Leaf,
  TrendingUp,
  Users,
  Vote,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

interface WorldTabProps {
  world: WorldState;
  onCivicAction?: (action: 'vote' | 'debate' | 'volunteer') => void;
  onConservationAction?: (donate: boolean) => void;
  civicFeedback?: string | null;
  civilizationFeedback?: string | null;
}

type WorldSubView = 'overview' | 'brazil' | 'regions' | 'countries' | 'timeline' | 'tech' | 'civilization';

export const WorldTab: React.FC<WorldTabProps> = ({
  world,
  onCivicAction,
  onConservationAction,
  civicFeedback,
  civilizationFeedback,
}) => {
  const [subView, setSubView] = useState<WorldSubView>('overview');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('Todas');

  const formattedDate = WorldClockEngine.formatDateBR(world.clock);
  const countriesList = Object.values(world.countries).sort(
    (a, b) => b.gdpBillionsUSD - a.gdpBillionsUSD
  );
  const citiesList = Object.values(world.brazil.cities)
    .filter((c) => regionFilter === 'Todas' || c.region === regionFilter)
    .sort((a, b) => b.population - a.population);
  const statesList = Object.entries(world.brazil.states)
    .filter(([, s]) => regionFilter === 'Todas' || s.region === regionFilter)
    .sort((a, b) => b[1].population - a[1].population);

  const unlockedCatalog = WorldTechnologyEngine.getCatalogForYear(world.clock.year);

  const visibleHistory = [...world.historicalLog]
    .filter((e) => timelineFilter === 'all' || e.scope === timelineFilter)
    .sort((a, b) => b.year - a.year);

  const formatPop = (pop: number) => {
    if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(2)} bi`;
    if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)} mi`;
    return pop.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'overview', label: 'Visão Global', icon: Globe },
            { id: 'brazil', label: 'Brasil & Política', icon: Flag },
            { id: 'regions', label: '27 UFs & Cidades', icon: MapPin },
            { id: 'countries', label: 'Países', icon: Landmark },
            { id: 'timeline', label: 'Linha do Tempo', icon: Clock },
            { id: 'tech', label: 'Tecnologia & Empresas', icon: Cpu },
            { id: 'civilization', label: 'Civilização & Ecologia', icon: Leaf },
          ].map((item) => {
            const Icon = item.icon;
            const active = subView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubView(item.id as WorldSubView)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  active
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={14} /> {item.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 tabular-nums px-2">
          <strong className="text-white">{formattedDate}</strong> ({world.clock.season}) · {world.clock.eraLabel}
        </div>
      </div>

      {/* 1. OVERVIEW */}
      {subView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-400" /> Economia Global
              </span>
              <div className="text-xl font-bold text-white mt-2">{world.economy.cyclePhase}</div>
              <p className="text-xs text-slate-400 mt-1">
                PIB: US$ {world.economy.globalGdpBillionsUSD.toLocaleString('pt-BR')} bi ({world.economy.globalGdpGrowthRate >= 0 ? '+' : ''}{world.economy.globalGdpGrowthRate}%)
              </p>
              <p className="text-xs text-slate-400">
                Inflação Global: {world.economy.globalInflationRate}% · Moradia: {world.economy.housingAffordabilityIndex}/100
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-sky-400" /> Demografia Mundial
              </span>
              <div className="text-xl font-bold text-white mt-2">{formatPop(world.population.worldPopulationTotal)}</div>
              <p className="text-xs text-slate-400 mt-1">Expectativa de Vida: {world.population.globalLifeExpectancy} anos</p>
              <p className="text-xs text-slate-400">Urbanização Global: {world.population.globalUrbanizationRate}%</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={14} className="text-purple-400" /> Índice Tecnológico
              </span>
              <div className="text-xl font-bold text-white mt-2">{world.technology.globalTechIndex} / 100</div>
              <p className="text-xs text-slate-400 mt-1">Brasil Tech: {world.technology.brazilTechIndex} / 100</p>
              <p className="text-xs text-slate-400">Custo de Vida (CPI): {world.economy.costOfLivingMultiplier.toFixed(2)}x</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf size={14} className="text-teal-400" /> Clima & Estação ({world.clock.season})
              </span>
              <div className="text-xl font-bold text-white mt-2">+{world.environment.globalTempAnomalyC}°C</div>
              <p className="text-xs text-slate-400 mt-1">Energia Renovável: {world.environment.renewableEnergySharePct}%</p>
              <p className="text-xs text-slate-400">Cobertura Florestal BR: {world.environment.brazilForestCoverPct}%</p>
            </div>
          </div>

          {world.environment.recentDisasters && world.environment.recentDisasters.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-5 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} /> Ocorrências Climáticas Recentes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {world.environment.recentDisasters.slice(-4).reverse().map((d) => (
                  <div key={d.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <div className="font-bold text-white">{d.year} ({d.season}) · {d.title}</div>
                    <p className="text-slate-400 mt-0.5">{d.region} · Severidade: {d.severity} — {d.impactNote}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cultura & Sociedade da Década ({world.clock.decade}s)</h3>
              <p className="text-xs text-emerald-400 font-medium">{world.culture.slangOrCulturalMarker}</p>
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div>
                  <span className="text-slate-400 block">Música Dominante</span>
                  <span className="text-slate-200">{world.culture.dominantMusicGenres.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mídia & Comunicação</span>
                  <span className="text-slate-200">{world.culture.dominantMediaFormats.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Moda</span>
                  <span className="text-slate-200">{world.culture.fashionTrend}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Digitalização / Cívica</span>
                  <span className="text-slate-200 tabular-nums">
                    {world.culture.socialValues.digitalization}% / {world.culture.socialValues.civicParticipation}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Instituições & Geopolítica</h3>
              <p className="text-xs text-slate-300">
                Alinhamento externo: <strong>{world.politics.brazilForeignAlignment}</strong>
              </p>
              <p className="text-xs text-slate-400">
                Tratados ativos: {world.politics.activeTreaties.join(' · ')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {world.institutions.institutions
                  .filter((inst) => inst.status !== 'Ainda não fundada')
                  .slice(0, 6)
                  .map((inst) => (
                    <div key={inst.id} className="bg-slate-800/60 border border-slate-800 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2">
                      <span className="text-slate-200 truncate">{inst.name}</span>
                      <span className="text-emerald-400 tabular-nums shrink-0">{inst.effectiveness}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BRAZIL */}
      {subView === 'brazil' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                  {world.brazil.phaseLabel}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {world.brazil.currentGovernment.leaderName}
                </h3>
                <p className="text-xs text-slate-400">
                  {world.brazil.currentGovernment.title} · {world.brazil.politicalRegimeType} · {world.brazil.constitution}
                </p>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-xs text-slate-400 block">Moeda Vigente</span>
                <span className="text-base font-bold text-amber-400">
                  {world.brazil.currency.name} ({world.brazil.currency.symbol})
                </span>
                <span className="block text-[11px] text-sky-400">
                  {formatTruthStatusLabel(world.brazil.currentGovernment.truthStatus)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs tabular-nums">
              <div className="bg-slate-800/60 p-3.5 rounded-xl">
                <span className="text-slate-400 block">População Brasil</span>
                <span className="text-base font-bold text-white">{formatPop(world.brazil.population)}</span>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-xl">
                <span className="text-slate-400 block">PIB / Crescimento</span>
                <span className="text-base font-bold text-white">US$ {world.brazil.gdpBillionsUSD} bi ({world.brazil.gdpGrowthRate}%)</span>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-xl">
                <span className="text-slate-400 block">Inflação / Selic</span>
                <span className="text-base font-bold text-amber-400">{world.brazil.annualInflationRate}% / {world.brazil.selicRate}%</span>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-xl">
                <span className="text-slate-400 block">Desemprego / Pobreza</span>
                <span className="text-base font-bold text-white">{world.brazil.unemploymentRate}% / {world.brazil.povertyRatePct}%</span>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-xl">
                <span className="text-slate-400 block">Dívida Pública / Impostos</span>
                <span className="text-base font-bold text-white">{world.brazil.publicDebtPctGdp}% PIB / {world.brazil.baseTaxRatePct}%</span>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-xl">
                <span className="text-slate-400 block">Salário Mínimo Nominal</span>
                <span className="text-base font-bold text-emerald-400">
                  {BrazilHistoricalSimulationEngine.formatMoney(world.brazil.minimumWageNominal * 100, world.brazil.currency)}
                </span>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-xl">
                <span className="text-slate-400 block">Salário Real (Base 100)</span>
                <span className="text-base font-bold text-white">{world.brazil.realWageIndex}</span>
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-xl">
                <span className="text-slate-400 block">Câmbio / Confiança Inst.</span>
                <span className="text-base font-bold text-white">
                  {world.brazil.exchangeRatePerUSD} / {world.brazil.institutionalTrust}%
                </span>
              </div>
            </div>

            {onCivicAction && (
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <strong className="text-white flex items-center gap-1.5">
                    <Vote size={14} className="text-emerald-400" /> Participação Cívica & Direitos ({world.politics.citizenParticipationScore}/100)
                  </strong>
                  <span className="text-slate-400">
                    {world.brazil.canVoteDirectly
                      ? `Voto direto ativo · Próxima eleição: ${world.brazil.nextElectionYear}`
                      : 'Sem eleições diretas vigentes neste regime histórico.'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onCivicAction('vote')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                  >
                    Votar
                  </button>
                  <button
                    onClick={() => onCivicAction('debate')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                  >
                    Debate Público
                  </button>
                  <button
                    onClick={() => onCivicAction('volunteer')}
                    className="bg-sky-700 hover:bg-sky-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                  >
                    Voluntariado
                  </button>
                </div>
              </div>
            )}
            {civicFeedback && (
              <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-3.5 py-2">
                {civicFeedback}
              </div>
            )}
          </div>

          {world.brazil.monetaryHistory && world.brazil.monetaryHistory.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Histórico de Conversões Monetárias no Save ({world.brazil.monetaryHistory.length})
              </h3>
              <div className="space-y-2 text-xs tabular-nums">
                {world.brazil.monetaryHistory.map((mr, i) => (
                  <div key={`${mr.year}_${i}`} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex flex-wrap justify-between gap-2">
                    <div>
                      <strong className="text-amber-400">{mr.year}</strong>: {mr.fromCurrency} → {mr.toCurrency} (÷{mr.divisor})
                      <span className="block text-slate-400">{mr.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ALL 27 UFs & CITIES */}
      {subView === 'regions' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Federação Brasileira — 27 Unidades Federativas & Cidades
              </h3>
              <p className="text-xs text-slate-400">
                Estimativas internas do simulador por macrorregião, porte urbano e eventos regionais.
              </p>
            </div>
            <select
              aria-label="Filtrar macrorregião"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="Todas">Todas as Regiões</option>
              <option value="Sudeste">Sudeste</option>
              <option value="Sul">Sul</option>
              <option value="Nordeste">Nordeste</option>
              <option value="Centro-Oeste">Centro-Oeste</option>
              <option value="Norte">Norte</option>
            </select>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Estados / Distrito Federal ({statesList.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 tabular-nums text-xs">
              {statesList.map(([stateName, st]) => (
                <div key={st.ufCode} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{stateName} ({st.ufCode})</span>
                    <span className="text-slate-400">{st.region}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-slate-300">
                    <span>Pop: {formatPop(st.population)}</span>
                    <span>Desemp: {st.unemploymentRate}%</span>
                    <span className="text-emerald-400">IDH est: {st.developmentIndex.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Cidades Simuladas ({citiesList.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 tabular-nums">
              {citiesList.map((city) => (
                <div key={city.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{city.name} ({city.ufCode})</h4>
                    <span className="text-[11px] text-emerald-400 uppercase">{city.tier}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">População:</span>
                      <span>{formatPop(city.population)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IDH est. / Seg.:</span>
                      <span className="text-emerald-400">{city.developmentIndex.toFixed(3)} / {city.safetyIndex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emprego / Custo:</span>
                      <span>{city.jobOpportunityIndex} / {city.costOfLivingIndex}</span>
                    </div>
                    {city.recentRegionalEvent && (
                      <p className="text-[11px] text-amber-300 pt-1 border-t border-slate-800">
                        {city.recentRegionalEvent}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. COUNTRIES */}
      {subView === 'countries' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Panorama Internacional ({world.clock.year})
          </h3>
          <table className="w-full text-left border-collapse text-xs tabular-nums">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 pr-4">País</th>
                <th className="py-2.5 pr-4">Regime</th>
                <th className="py-2.5 pr-4">População</th>
                <th className="py-2.5 pr-4">PIB (US$ bi)</th>
                <th className="py-2.5 pr-4">Cresc.</th>
                <th className="py-2.5 pr-4">Inflação</th>
                <th className="py-2.5">Relação c/ Brasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {countriesList.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40">
                  <td className="py-3 pr-4 font-bold text-white">
                    {c.name} <span className="text-slate-400 font-normal">({c.capital})</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{c.regimeType}</td>
                  <td className="py-3 pr-4 text-slate-300">{formatPop(c.population)}</td>
                  <td className="py-3 pr-4 text-emerald-400 font-semibold">{c.gdpBillionsUSD.toLocaleString('pt-BR')}</td>
                  <td className={`py-3 pr-4 font-semibold ${c.gdpGrowthRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {c.gdpGrowthRate >= 0 ? '+' : ''}{c.gdpGrowthRate}%
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{c.inflationRate}%</td>
                  <td className="py-3 text-slate-300">{c.diplomaticRelationWithBrazil}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. TIMELINE */}
      {subView === 'timeline' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Linha do Tempo Histórica até {world.clock.year}
              </h3>
              <p className="text-xs text-slate-400">
                Acontecimentos posteriores ao ano atual não são exibidos antecipadamente.
              </p>
            </div>
            <select
              value={timelineFilter}
              onChange={(e) => setTimelineFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="all">Todos os Escopos</option>
              <option value="brazil">Brasil</option>
              <option value="global">Mundial</option>
              <option value="economic">Economia</option>
              <option value="scientific">Ciência & Tech</option>
              <option value="cultural">Cultura</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {visibleHistory.map((evt) => (
              <div key={evt.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-400 tabular-nums">{evt.year}</span>
                    <span className="text-slate-400">· {evt.region || evt.scope.toUpperCase()}</span>
                    <span className={evt.truthStatus === 'FUTURE_PROJECTION' ? 'text-sky-400 font-semibold' : 'text-slate-400'}>
                      · {formatTruthStatusLabel(evt.truthStatus)}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{evt.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{evt.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TECH & COMPANIES */}
      {subView === 'tech' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Árvore Tecnológica até {world.clock.year} ({unlockedCatalog.length} marcos)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unlockedCatalog.map((tech) => {
                const adoption = world.technology.adoptedTechRates[tech.id] ?? 10;
                return (
                  <div key={tech.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-sm">{tech.name}</h4>
                      <span className="text-xs text-emerald-400 tabular-nums font-semibold">{adoption}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {tech.category} · Marco {tech.inventionYear} · {tech.originRegion}
                    </p>
                    <p className="text-xs text-slate-300 mt-2">{tech.description}</p>
                    {tech.dependencies.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        Pré-requisitos: {tech.dependencies.join(', ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-emerald-400" /> Empresas Atuantes no Mercado ({world.companies.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 tabular-nums">
              {world.companies.map((comp) => (
                <div key={comp.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm truncate">
                      {comp.name} {comp.playerOwned ? '(Sua)' : ''}
                    </h4>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        comp.status === 'Em Expansão'
                          ? 'text-emerald-400'
                          : comp.status === 'Em Crise' || comp.status === 'Faliu'
                            ? 'text-amber-400'
                            : 'text-slate-300'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {comp.sector} · {comp.headquartersCity}
                  </p>
                  <div className="text-xs text-slate-300 mt-2 flex justify-between">
                    <span>Valor: R$ {comp.valuationBillionsBRL} bi</span>
                    <span>Vagas: {comp.hiringCapacity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. CIVILIZATION, CAUSALITY, RELIGIONS, WARS & ZOOS/CONSERVATION */}
      {subView === 'civilization' && (
        <div className="space-y-6">
          {civilizationFeedback && (
            <div className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 rounded-xl px-4 py-3 text-xs">
              {civilizationFeedback}
            </div>
          )}

          {world.causality && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ciclo Causal Multidomínio (Tecnologia → Economia → Sociedade → Política)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Indicadores estruturais recalculados a cada ciclo com amortecimento anti-explosão.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-400 block">Tecnologia</span>
                  <span className="text-base font-bold text-white">{world.causality.technologyIndex}/100</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-400 block">Produtividade</span>
                  <span className="text-base font-bold text-emerald-400">{world.causality.productivityIndex}/100</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-400 block">Saúde Empresarial</span>
                  <span className="text-base font-bold text-white">{world.causality.businessHealthIndex}/100</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-400 block">Salário Real (Base 100)</span>
                  <span className="text-base font-bold text-sky-400">{world.causality.realWageIndex}</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-400 block">Vitalidade Regional</span>
                  <span className="text-base font-bold text-white">{world.causality.regionalVitalityIndex}/100</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-400 block">Pressão Migratória</span>
                  <span className="text-base font-bold text-amber-400">{world.causality.migrationPressureIndex}/100</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-400 block">Coesão Social</span>
                  <span className="text-base font-bold text-white">{world.causality.socialCohesionIndex}/100</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                  <span className="text-slate-400 block">Estabilidade Institucional</span>
                  <span className="text-base font-bold text-emerald-400">{world.causality.institutionalStabilityIndex}/100</span>
                </div>
              </div>
            </div>
          )}

          {world.civilization && (
            <>
              {/* Conservation, Parks & Zoos */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Leaf size={16} className="text-emerald-400" /> Parques Nacionais, Zoológicos & Biodiversidade
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Preservação de fauna brasileira, santuários ecológicos e monitoramento de desmatamento.
                    </p>
                  </div>
                  {onConservationAction && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onConservationAction(false)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap"
                      >
                        Visitar Parque / Zoológico
                      </button>
                      <button
                        type="button"
                        onClick={() => onConservationAction(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap"
                      >
                        Apoiar Conservação
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs tabular-nums">
                  <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                    <span className="text-slate-400 block">Parques Nacionais</span>
                    <span className="text-base font-bold text-white">{world.civilization.conservation.nationalParksCount}</span>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                    <span className="text-slate-400 block">Zoológicos & Centros</span>
                    <span className="text-base font-bold text-white">{world.civilization.conservation.zoosCount}</span>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                    <span className="text-slate-400 block">Espécies Protegidas</span>
                    <span className="text-base font-bold text-emerald-400">{world.civilization.conservation.protectedSpeciesCount}</span>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                    <span className="text-slate-400 block">Índice Conservação</span>
                    <span className="text-base font-bold text-white">{world.civilization.conservation.conservationIndex}/100</span>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3">
                    <span className="text-slate-400 block">Alerta Desmatamento</span>
                    <span className="text-base font-bold text-amber-400">{world.civilization.conservation.deforestationAlertLevel}/100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Pluralismo Religioso & Tradições ({world.clock.year})
                  </h3>
                  <div className="space-y-2 text-xs tabular-nums">
                    {world.civilization.religions.map((rel) => (
                      <div key={rel.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 space-y-1">
                        <div className="flex justify-between font-semibold text-white">
                          <span>{rel.name}</span>
                          <span className="text-emerald-400">{rel.sharePct.toFixed(1)}%</span>
                        </div>
                        <p className="text-slate-400">{rel.socialRole}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Movimentos Sociais & Cívicos
                    </h3>
                    {world.civilization.socialMovements.map((mov) => (
                      <div key={mov.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs tabular-nums">
                        <div>
                          <div className="font-semibold text-white">{mov.name}</div>
                          <div className="text-slate-400">{mov.focus}</div>
                        </div>
                        <span className="text-sky-400 font-semibold shrink-0">{mov.supportPct}% apoio</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Conflitos, Sanções & Tensões Geopolíticas
                    </h4>
                    {world.civilization.activeWarsAndSanctions.length === 0 ? (
                      <p className="text-xs text-slate-400">Nenhuma guerra ou sanção comercial sistêmica em escala crítica neste ano.</p>
                    ) : (
                      world.civilization.activeWarsAndSanctions.map((w) => (
                        <div key={w.id} className="bg-slate-800/50 border border-slate-800 rounded-xl p-3 text-xs tabular-nums space-y-1">
                          <div className="flex justify-between font-semibold text-white">
                            <span>{w.title}</span>
                            <span className="text-amber-400">{w.diplomaticStatus}</span>
                          </div>
                          <p className="text-slate-400">
                            {w.region} · {w.actors.join(' vs ')} · Choque Econômico {w.economicShockPct}%
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
