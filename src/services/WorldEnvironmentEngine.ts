import { ClimateDisasterRecord, WorldEnvironmentState, WorldState } from '../types/world';
import { resolveSeasonSouthernHemisphere } from './WorldClockEngine';

export class WorldEnvironmentEngine {
  static createInitialState(year: number): WorldEnvironmentState {
    const devRatio = Math.max(0, Math.min(1.5, (year - 1900) / 126));
    const tempAnomaly = Number((0.15 + devRatio * 1.15).toFixed(2));
    const forestCover = Number(Math.max(48, 86 - devRatio * 24).toFixed(1));
    const renewable = year < 1970 ? 22 : year < 2010 ? 38 : Math.min(82, 44 + (year - 2010) * 1.1);

    return {
      globalTempAnomalyC: tempAnomaly,
      brazilForestCoverPct: forestCover,
      renewableEnergySharePct: Number(renewable.toFixed(1)),
      airQualityIndexBrazil: year < 1950 ? 88 : year < 2000 ? 64 : 71,
      extremeWeatherRisk: Math.round(15 + tempAnomaly * 32),
      activeClimateEvents: tempAnomaly > 1.1 ? ['Ondas de calor sazonais'] : [],
      recentDisasters: [],
    };
  }

  static advanceYear(world: WorldState, year: number): ClimateDisasterRecord | null {
    const env = world.environment;
    const hasCleanTech = world.technology.unlockedTechIds.includes('tech_renewable_grid');
    const tempStep = hasCleanTech && env.renewableEnergySharePct > 55 ? 0.006 : 0.014;

    env.globalTempAnomalyC = Number(Math.min(3.2, env.globalTempAnomalyC + tempStep).toFixed(2));
    if (hasCleanTech) {
      env.renewableEnergySharePct = Number(
        Math.min(92, env.renewableEnergySharePct + 0.65).toFixed(1)
      );
    }
    const forestPressure = world.brazil.gdpGrowthRate > 3.5 ? -0.14 : -0.05;
    const conservationFactor = year >= 2004 ? 0.06 : 0;
    env.brazilForestCoverPct = Number(
      Math.max(35, Math.min(90, env.brazilForestCoverPct + forestPressure + conservationFactor)).toFixed(1)
    );
    env.extremeWeatherRisk = Math.min(95, Math.round(18 + env.globalTempAnomalyC * 32));
    env.airQualityIndexBrazil = Math.round(
      Math.max(
        40,
        Math.min(95, 58 + env.renewableEnergySharePct * 0.35 - (world.brazil.urbanizationRate > 85 ? 8 : 0))
      )
    );

    env.activeClimateEvents = [];
    if (env.extremeWeatherRisk > 58) {
      env.activeClimateEvents.push('Alertas sazonais de chuvas intensas e estiagem');
    }

    if (!env.recentDisasters) env.recentDisasters = [];

    // Deterministic seasonal disaster check
    const seedHash = Math.abs(
      world.seed.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, year)
    );
    const threshold = Math.max(12, Math.round(100 - env.extremeWeatherRisk * 0.65));
    let newDisaster: ClimateDisasterRecord | null = null;

    if (seedHash % 100 > threshold || year === 2024) {
      const season = resolveSeasonSouthernHemisphere(world.clock.month);
      const templates: Omit<ClimateDisasterRecord, 'id' | 'year' | 'season'>[] = [
        {
          region: 'Sul',
          title: 'Enchentes Severas na Bacia Sul',
          severity: env.extremeWeatherRisk > 60 ? 'Extremo' : 'Alto',
          impactNote: 'Pressão temporária nos preços de alimentos e logística regional.',
        },
        {
          region: 'Nordeste',
          title: 'Seca Prolongada no Semiárido',
          severity: 'Alto',
          impactNote: 'Elevação do custo alimentar e estímulo a obras hídricas.',
        },
        {
          region: 'Sudeste',
          title: 'Tempestades de Verão e Alagamentos Urbanos',
          severity: 'Moderado',
          impactNote: 'Impacto pontual em infraestrutura urbana e mobilidade.',
        },
        {
          region: 'Centro-Oeste / Norte',
          title: 'Onda de Calor e Queimadas Sazonais',
          severity: 'Alto',
          impactNote: 'Queda temporária da qualidade do ar regional.',
        },
      ];
      const chosen = year === 2024 ? templates[0] : templates[seedHash % templates.length];
      newDisaster = {
        id: `cli_${year}_${seedHash % 997}`,
        year,
        season,
        ...chosen,
      };
      env.recentDisasters.push(newDisaster);
      env.recentDisasters = env.recentDisasters.slice(-15);
      env.activeClimateEvents.push(newDisaster.title);
    }

    return newDisaster;
  }
}
