import { WorldInstitutionState, WorldState } from '../types/world';

const INSTITUTIONS_CATALOG = [
  { id: 'inst_banco_brasil', name: 'Banco do Brasil', countryId: 'BRA', foundedYear: 1808 },
  { id: 'inst_usp', name: 'Universidade de São Paulo (USP)', countryId: 'BRA', foundedYear: 1934 },
  { id: 'inst_justica_trabalho', name: 'Justiça do Trabalho & CLT', countryId: 'BRA', foundedYear: 1943 },
  { id: 'inst_petrobras', name: 'Petrobras', countryId: 'BRA', foundedYear: 1953 },
  { id: 'inst_banco_central', name: 'Banco Central do Brasil', countryId: 'BRA', foundedYear: 1964 },
  { id: 'inst_embrapa', name: 'Embrapa (Pesquisa Agropecuária)', countryId: 'BRA', foundedYear: 1973 },
  { id: 'inst_sus', name: 'SUS (Sistema Único de Saúde)', countryId: 'BRA', foundedYear: 1988 },
  { id: 'inst_pix', name: 'Sistema de Pagamentos Instantâneos (Pix)', countryId: 'BRA', foundedYear: 2020 },
  { id: 'inst_onu', name: 'Organização das Nações Unidas (ONU)', countryId: 'GLOBAL', foundedYear: 1945 },
];

export class WorldInstitutionEngine {
  static createInitialState(year: number): WorldInstitutionState {
    return {
      institutions: INSTITUTIONS_CATALOG.map((inst) => ({
        ...inst,
        status: year >= inst.foundedYear ? 'Ativa' : 'Ainda não fundada',
        effectiveness: year >= inst.foundedYear ? 66 : 0,
        publicTrust: year >= inst.foundedYear ? 60 : 0,
      })),
    };
  }

  static advanceYear(world: WorldState, year: number): void {
    const trustAnchor = world.brazil.institutionalTrust;
    world.institutions.institutions = world.institutions.institutions.map((inst) => {
      if (year < inst.foundedYear) {
        return { ...inst, status: 'Ainda não fundada', effectiveness: 0, publicTrust: 0 };
      }
      const nextEff = Math.min(
        95,
        Math.max(40, (inst.effectiveness || 60) + (world.brazil.gdpGrowthRate > 0 ? 0.35 : -0.2))
      );
      const nextTrust = Math.min(
        92,
        Math.max(25, Math.round((inst.publicTrust || 55) * 0.7 + trustAnchor * 0.3))
      );
      return {
        ...inst,
        status: nextEff > 78 ? 'Fortalecida' : 'Ativa',
        effectiveness: Number(nextEff.toFixed(1)),
        publicTrust: nextTrust,
      };
    });
  }
}
