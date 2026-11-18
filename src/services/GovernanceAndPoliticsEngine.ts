import {
  GameSave,
  GovernmentAdministrationState,
  PoliticalOfficeTitle,
  WorldState,
} from '../types';

export interface PoliticalOfficeSpec {
  office: PoliticalOfficeTitle;
  scope: 'Municipal' | 'Estadual' | 'Federal';
  minAge: number;
  minReputation: number;
  campaignCostCentavos: number;
  termYears: number;
  annualSalaryCentavos: number;
  minYear?: number;
}

export const POLITICAL_OFFICES_CATALOG: PoliticalOfficeSpec[] = [
  { office: 'Vereador', scope: 'Municipal', minAge: 18, minReputation: 35, campaignCostCentavos: 1200000, termYears: 4, annualSalaryCentavos: 14400000 },
  { office: 'Prefeito', scope: 'Municipal', minAge: 21, minReputation: 50, campaignCostCentavos: 6500000, termYears: 4, annualSalaryCentavos: 26400000 },
  { office: 'Deputado Estadual', scope: 'Estadual', minAge: 21, minReputation: 52, campaignCostCentavos: 5500000, termYears: 4, annualSalaryCentavos: 31200000 },
  { office: 'Deputado Federal', scope: 'Federal', minAge: 21, minReputation: 60, campaignCostCentavos: 11000000, termYears: 4, annualSalaryCentavos: 44000000 },
  { office: 'Governador', scope: 'Estadual', minAge: 30, minReputation: 68, campaignCostCentavos: 24000000, termYears: 4, annualSalaryCentavos: 42000000 },
  { office: 'Senador', scope: 'Federal', minAge: 35, minReputation: 72, campaignCostCentavos: 19000000, termYears: 8, annualSalaryCentavos: 46000000 },
  { office: 'Presidente', scope: 'Federal', minAge: 35, minReputation: 78, campaignCostCentavos: 55000000, termYears: 4, annualSalaryCentavos: 48000000, minYear: 1889 },
];

export const POLITICAL_PARTIES = [
  { id: 'part_centro_social', name: 'Movimento Democrático Brasileiro (Centro-Social)', ideology: 'Social-Democrata' },
  { id: 'part_liberal_progresso', name: 'Aliança pelo Progresso Econômico', ideology: 'Liberal Reformista' },
  { id: 'part_trabalhista', name: 'Frente Trabalhista e Desenvolvimento', ideology: 'Desenvolvimentista' },
  { id: 'part_verde', name: 'Partido Sustentabilidade & Ciência', ideology: 'Socioambiental' },
];

export const PUBLIC_POLICY_PROGRAMS = [
  { id: 'prog_saneamento', name: 'Plano Universal de Saneamento', costBudgetPct: 4, healthBoost: 3, approvalBoost: 5 },
  { id: 'prog_escola_integral', name: 'Escolas em Tempo Integral & Técnicas', costBudgetPct: 5, literacyBoost: 2, approvalBoost: 5 },
  { id: 'prog_sus_digital', name: 'Prontuário & Telemedicina SUS', costBudgetPct: 3, healthBoost: 2, approvalBoost: 4 },
  { id: 'prog_seguranca_inteligente', name: 'Integração Forense & Policiamento Comunitário', costBudgetPct: 4, safetyBoost: 4, approvalBoost: 4 },
  { id: 'prog_ciencia_inovacao', name: 'Fundo Nacional de Ciência & Startups', costBudgetPct: 4, techBoost: 2.5, approvalBoost: 3 },
  { id: 'prog_renda_minima', name: 'Transferência Social Focalizada', costBudgetPct: 5, povertyReduction: 2.2, approvalBoost: 6 },
];

export class GovernanceAndPoliticsEngine {
  static createInitialAdminState(world?: WorldState): GovernmentAdministrationState {
    return {
      scope: 'Federal',
      playerControlled: false,
      activeOfficeTitle: 'Nenhum',
      taxRatePct: world?.brazil.baseTaxRatePct ?? 26,
      budgets: {
        health: 18,
        education: 20,
        security: 15,
        infrastructure: 16,
        science: 7,
        environment: 6,
        socialPrograms: 18,
      },
      fiscalBalancePctGdp: -1.8,
      publicSatisfaction: 56,
      corruptionAuditScore: 68,
      activePrograms: ['prog_sus_digital'],
      recentDecisions: [],
    };
  }

  static runForOffice(
    save: GameSave,
    office: PoliticalOfficeTitle,
    partyName: string
  ): { elected: boolean; voteSharePct: number; summary: string } {
    const world = save.worldState!;
    const year = world.clock.year;
    const spec = POLITICAL_OFFICES_CATALOG.find((o) => o.office === office);
    if (!spec) throw new Error('Cargo político inválido.');
    if (spec.minYear && year < spec.minYear) {
      throw new Error(`O cargo de ${office} não está disponível em ${year}.`);
    }
    if (save.character.status !== 'Vivo') {
      throw new Error('Apenas cidadãos em liberdade e ativos podem concorrer a eleições.');
    }
    if (save.character.currentAge < spec.minAge) {
      throw new Error(`Idade mínima constitucional para ${office} é ${spec.minAge} anos.`);
    }
    if (save.character.reputation < spec.minReputation) {
      throw new Error(`Reputação mínima recomendada de ${spec.minReputation}% para viabilizar candidatura a ${office}.`);
    }
    if (!world.brazil.canVoteDirectly && spec.scope === 'Federal') {
      throw new Error(`Eleições diretas federais suspensas durante o regime de ${year}.`);
    }

    const scale = Math.max(0.4, Math.min(50, world.economy.costOfLivingMultiplier || 1));
    const campaignCost = Math.round(spec.campaignCostCentavos * scale);
    if (save.character.money < campaignCost) {
      throw new Error(`Recursos insuficientes para campanha eleitoral.`);
    }
    save.character.money -= campaignCost;

    const charismaScore = save.character.charisma * 0.35;
    const repScore = save.character.reputation * 0.4;
    const intScore = save.character.intelligence * 0.15;
    const civicScore = (world.politics.citizenParticipationScore || 55) * 0.1;
    const baseScore = charismaScore + repScore + intScore + civicScore;
    const threshold = spec.minReputation * 0.92;
    const voteSharePct = Number(Math.max(8, Math.min(78, (baseScore / 100) * 68)).toFixed(1));
    const elected = baseScore >= threshold;

    if (!save.character.politics) {
      save.character.politics = {
        office: 'Nenhum',
        mandateYearsRemaining: 0,
        approvalRating: 50,
        campaignFundsCentavos: 0,
        termCount: 0,
        impeachmentRisk: 0,
        billsPassed: 0,
      };
    }

    const party = POLITICAL_PARTIES.find((p) => p.name === partyName) || POLITICAL_PARTIES[0];
    save.character.politics.party = party.name;
    save.character.politics.ideology = party.ideology;

    if (elected) {
      save.character.politics.office = spec.office;
      save.character.politics.mandateYearsRemaining = spec.termYears;
      save.character.politics.approvalRating = Math.round(Math.min(82, Math.max(48, voteSharePct + 10)));
      save.character.politics.termCount += 1;
      save.character.politics.impeachmentRisk = 5;
      save.character.careerTitle = `${spec.office} (${spec.scope})`;
      save.character.careerCompany = `Poder Público · ${spec.scope}`;
      save.character.salary = Math.round(spec.annualSalaryCentavos * scale);

      if (!world.governmentAdmin) {
        world.governmentAdmin = this.createInitialAdminState(world);
      }
      world.governmentAdmin.scope = spec.scope;
      world.governmentAdmin.playerControlled = true;
      world.governmentAdmin.activeOfficeTitle = spec.office;
      world.governmentAdmin.mandateStartYear = year;
      world.governmentAdmin.mandateEndYear = year + spec.termYears;

      return {
        elected: true,
        voteSharePct,
        summary: `Eleito(a) ${spec.office} com ${voteSharePct}% dos votos válidos pelo ${party.name}! Modo de Administração Governamental (${spec.scope}) ativado.`,
      };
    }

    return {
      elected: false,
      voteSharePct,
      summary: `Candidatura a ${spec.office} obteve ${voteSharePct}% dos votos, sem alcançar o quociente eleitoral desta vez.`,
    };
  }

  static updateGovernmentPolicy(
    save: GameSave,
    input: {
      taxRatePct?: number;
      budgets?: Partial<GovernmentAdministrationState['budgets']>;
      toggleProgramId?: string;
      runCorruptionAudit?: boolean;
    }
  ): string {
    const world = save.worldState!;
    if (!world.governmentAdmin) {
      world.governmentAdmin = this.createInitialAdminState(world);
    }
    const gov = world.governmentAdmin;
    const isElected = (save.character.politics?.office ?? 'Nenhum') !== 'Nenhum';
    if (!isElected && !gov.playerControlled) {
      // Allow sandbox or elected office
      throw new Error('Eleja-se a um cargo público (Prefeito, Governador, Presidente, etc.) ou ative o Conselho Gestor para alterar o orçamento público.');
    }

    const actions: string[] = [];

    if (input.taxRatePct !== undefined && Number.isFinite(input.taxRatePct)) {
      const clampedTax = Math.max(10, Math.min(48, Number(input.taxRatePct.toFixed(1))));
      gov.taxRatePct = clampedTax;
      world.brazil.baseTaxRatePct = clampedTax;
      actions.push(`Carga tributária ajustada para ${clampedTax}%`);
    }

    if (input.budgets) {
      const merged = { ...gov.budgets, ...input.budgets };
      const sum =
        merged.health +
        merged.education +
        merged.security +
        merged.infrastructure +
        merged.science +
        merged.environment +
        merged.socialPrograms;
      if (sum > 0) {
        // Normalize cleanly to 100%
        const factor = 100 / sum;
        gov.budgets = {
          health: Math.round(merged.health * factor),
          education: Math.round(merged.education * factor),
          security: Math.round(merged.security * factor),
          infrastructure: Math.round(merged.infrastructure * factor),
          science: Math.round(merged.science * factor),
          environment: Math.round(merged.environment * factor),
          socialPrograms: Math.max(1, 100 - (
            Math.round(merged.health * factor) +
            Math.round(merged.education * factor) +
            Math.round(merged.security * factor) +
            Math.round(merged.infrastructure * factor) +
            Math.round(merged.science * factor) +
            Math.round(merged.environment * factor)
          )),
        };
        actions.push(`Orçamento público redistribuído (Saúde ${gov.budgets.health}%, Educação ${gov.budgets.education}%, Segurança ${gov.budgets.security}%)`);
      }
    }

    if (input.toggleProgramId) {
      const prog = PUBLIC_POLICY_PROGRAMS.find((p) => p.id === input.toggleProgramId);
      if (!prog) throw new Error('Programa público não encontrado.');
      if (gov.activePrograms.includes(prog.id)) {
        gov.activePrograms = gov.activePrograms.filter((id) => id !== prog.id);
        actions.push(`Programa "${prog.name}" encerrado`);
      } else {
        gov.activePrograms.push(prog.id);
        gov.publicSatisfaction = Math.min(98, gov.publicSatisfaction + prog.approvalBoost);
        if (prog.techBoost) {
          world.technology.brazilTechIndex = Math.min(100, Number((world.technology.brazilTechIndex + prog.techBoost).toFixed(1)));
        }
        if (prog.povertyReduction) {
          world.brazil.povertyRatePct = Math.max(2, Number((world.brazil.povertyRatePct - prog.povertyReduction).toFixed(1)));
        }
        actions.push(`Programa "${prog.name}" implementado`);
      }
    }

    if (input.runCorruptionAudit) {
      gov.corruptionAuditScore = Math.min(98, gov.corruptionAuditScore + 6);
      world.brazil.institutionalTrust = Math.min(95, world.brazil.institutionalTrust + 3);
      gov.publicSatisfaction = Math.min(96, gov.publicSatisfaction + 4);
      actions.push('Auditoria independente da Controladoria concluída com aumento de transparência');
    }

    // Fiscal balance update
    const programLoad = gov.activePrograms.length * 0.9;
    gov.fiscalBalancePctGdp = Number(((gov.taxRatePct - 24) * 0.35 - programLoad).toFixed(2));
    if (gov.fiscalBalancePctGdp < -5) {
      world.brazil.publicDebtPctGdp = Math.min(180, Number((world.brazil.publicDebtPctGdp + 1.2).toFixed(1)));
    }

    const summary = actions.join(' · ') || 'Diretrizes administrativas revisadas.';
    gov.recentDecisions.unshift(`${world.clock.year}: ${summary}`);
    gov.recentDecisions = gov.recentDecisions.slice(0, 15);
    return summary;
  }

  static advanceYear(save: GameSave, year: number): string[] {
    const world = save.worldState!;
    if (!world.governmentAdmin) {
      world.governmentAdmin = this.createInitialAdminState(world);
    }
    const gov = world.governmentAdmin;
    const notes: string[] = [];

    // Apply ongoing governance budget effects to macro world
    if (gov.budgets.education >= 22) {
      world.brazil.literacyRate = Math.min(99.8, Number((world.brazil.literacyRate + 0.15).toFixed(2)));
    }
    if (gov.budgets.science >= 10) {
      world.technology.brazilTechIndex = Math.min(100, Number((world.technology.brazilTechIndex + 0.25).toFixed(2)));
    }
    if (gov.budgets.environment >= 10) {
      world.environment.brazilForestCoverPct = Math.min(90, Number((world.environment.brazilForestCoverPct + 0.08).toFixed(1)));
    }

    const pol = save.character.politics;
    if (pol && pol.office !== 'Nenhum') {
      if (pol.mandateYearsRemaining > 0) {
        pol.mandateYearsRemaining -= 1;
        pol.approvalRating = Math.max(12, Math.min(92, Math.round(pol.approvalRating * 0.7 + gov.publicSatisfaction * 0.3 + (world.brazil.gdpGrowthRate > 1.5 ? 2 : -2))));
        gov.publicSatisfaction = pol.approvalRating;

        if (pol.approvalRating < 22 && gov.corruptionAuditScore < 42) {
          pol.impeachmentRisk = Math.min(95, pol.impeachmentRisk + 25);
          if (pol.impeachmentRisk >= 80) {
            notes.push(`Processo de impeachment encerrado: ${pol.office} perdeu o mandato em ${year}.`);
            pol.office = 'Nenhum';
            pol.mandateYearsRemaining = 0;
            gov.playerControlled = false;
            gov.activeOfficeTitle = 'Nenhum';
            save.character.careerTitle = undefined;
            save.character.salary = 0;
          }
        }
      }
      if (pol.mandateYearsRemaining === 0 && pol.office !== 'Nenhum') {
        notes.push(`Mandato de ${pol.office} concluído em ${year}. Você pode disputar reeleição ou novo cargo.`);
        pol.office = 'Nenhum';
        gov.playerControlled = false;
        gov.activeOfficeTitle = 'Nenhum';
      }
    }

    return notes;
  }
}
