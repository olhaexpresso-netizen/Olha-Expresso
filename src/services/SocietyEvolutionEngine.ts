import { WorldState } from '../types/world';
import { WorldCultureEngine } from './WorldCultureEngine';

/**
 * SocietyEvolutionEngine tracks lifestyle, education expectations, era-scaled tuition, and social mobility indicators.
 */
export class SocietyEvolutionEngine {
  static stepYear(world: WorldState, year: number): void {
    WorldCultureEngine.advanceYear(world, year);
  }

  static getAvailableEducationPrograms(
    year: number,
    world?: WorldState
  ): {
    id: string;
    name: string;
    minYear: number;
    levelRequired: string;
    costCentavos: number;
    durationYears: number;
  }[] {
    const cpiScale = world
      ? Math.max(0.45, Math.min(2500, world.economy.costOfLivingMultiplier))
      : 1;

    const programs = [
      { id: 'edu_basico', name: 'Ensino Fundamental Completo', minYear: 1850, levelRequired: 'Nenhum', costCentavos: 0, durationYears: 4 },
      { id: 'edu_medio', name: 'Ensino Médio / Técnico Profissionalizante', minYear: 1930, levelRequired: 'Fundamental', costCentavos: 0, durationYears: 3 },
      { id: 'edu_direito', name: 'Universidade de Direito', minYear: 1827, levelRequired: 'Médio', costCentavos: Math.round(180000 * cpiScale), durationYears: 4 },
      { id: 'edu_medicina', name: 'Universidade de Medicina', minYear: 1808, levelRequired: 'Médio', costCentavos: Math.round(420000 * cpiScale), durationYears: 5 },
      { id: 'edu_engenharia', name: 'Universidade de Engenharia Civil e Industrial', minYear: 1874, levelRequired: 'Médio', costCentavos: Math.round(240000 * cpiScale), durationYears: 4 },
      { id: 'edu_economia', name: 'Universidade de Administração & Economia', minYear: 1945, levelRequired: 'Médio', costCentavos: Math.round(160000 * cpiScale), durationYears: 4 },
      { id: 'edu_computacao', name: 'Universidade de Ciência da Computação', minYear: 1978, levelRequired: 'Médio', costCentavos: Math.round(210000 * cpiScale), durationYears: 4 },
      { id: 'edu_tecnologo_ia', name: 'Pós-graduação em Ciência de Dados & IA', minYear: 2018, levelRequired: 'Universidade', costCentavos: Math.round(290000 * cpiScale), durationYears: 2 },
    ];
    return programs.filter((p) => year >= p.minYear);
  }
}
