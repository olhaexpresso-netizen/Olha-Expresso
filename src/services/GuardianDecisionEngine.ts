import { GameSave, FamilyMember } from '../types';

export interface GuardianDecisionRecord {
  id: string;
  year: number;
  guardianName: string;
  decisionType: 'SCHOOL_ENROLLMENT' | 'RESIDENCE_RELOCATION' | 'MEDICAL_CARE' | 'BUDGET_ADJUSTMENT' | 'FAMILY_CRISIS_RESPONSE';
  title: string;
  description: string;
  impactOnChild: string;
  financialImpact: number;
}

export class GuardianDecisionEngine {
  /**
   * Simulate guardian decisions for childhood (ages 0 to 11)
   */
  public static simulateGuardianDecisionIfNeeded(save: GameSave): GuardianDecisionRecord {
    const age = save.character.currentAge || 0;
    const currentYear = save.worldState?.clock?.year || 2026;
    const guardians = (save.family || []).filter((f) => f.alive && (f.relation === 'Pai' || f.relation === 'Mãe'));
    const guardian = guardians.length > 0 ? guardians[0] : { name: 'Responsável Familiar', relation: 'Pai' };

    const possibleDecisions: Omit<GuardianDecisionRecord, 'id' | 'year' | 'guardianName'>[] = [
      {
        decisionType: 'SCHOOL_ENROLLMENT',
        title: age <= 2 ? 'Acompanhamento Pediátrico e Vacinação' : 'Matrícula em Instituição de Ensino',
        description: age <= 2
          ? `${guardian.name} organizou o calendário de vacinação e consultas de rotina para acompanhar o desenvolvimento motor e imunológico.`
          : `${guardian.name} avaliou as opções na região e matriculou você na rede escolar local, buscando garantir boa base educacional.`,
        impactOnChild: age <= 2 ? 'Saúde e imunidade fortalecidas na primeira infância.' : 'Início da socialização escolar e aprendizado estruturado.',
        financialImpact: -1500,
      },
      {
        decisionType: 'BUDGET_ADJUSTMENT',
        title: 'Reorganização do Orçamento Doméstico',
        description: `${guardian.name} reviu os gastos da casa para absorver variações na inflação e garantir estabilidade financeira para a família.`,
        impactOnChild: 'Ambiente familiar com estabilidade nas despesas essenciais.',
        financialImpact: 0,
      },
      {
        decisionType: 'RESIDENCE_RELOCATION',
        title: 'Avaliação de Mudança Residencial',
        description: `${guardian.name} considerou opções de moradia mais próximas a escolas e postos de saúde para facilitar o dia a dia da família.`,
        impactOnChild: 'Melhoria na logística diária e acesso a serviços comunitários.',
        financialImpact: -5000,
      },
    ];

    const index = (currentYear + age) % possibleDecisions.length;
    const chosen = possibleDecisions[index];

    const record: GuardianDecisionRecord = {
      id: `guard_dec_${currentYear}_${Math.random().toString(36).substring(2, 7)}`,
      year: currentYear,
      guardianName: guardian.name,
      ...chosen,
    };

    if (!save.history) save.history = [];
    const summaryText = `[Decisão Familiar] ${record.title}: ${record.description}`;
    const alreadyExists = save.history.some((h: any) => h.year === currentYear && h.summary?.includes(record.title));
    if (!alreadyExists) {
      save.history.push({
        year: currentYear,
        summary: summaryText,
      } as any);

      if (record.financialImpact !== 0 && save.character.money !== undefined) {
        save.character.money += record.financialImpact;
      }
    }

    return record;
  }
}
