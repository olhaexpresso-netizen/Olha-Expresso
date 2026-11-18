import { Asset, WorldState } from '../types';
import { WorldEconomyEngine } from './WorldEconomyEngine';

export interface AssetCatalogItem {
  id: string;
  name: string;
  type: Asset['type'];
  priceCentavos: number;
  monthlyIncomeCentavos: number;
  minYear: number;
  description: string;
}

const RAW_ASSET_TEMPLATES: {
  id: string;
  name: string;
  type: Asset['type'];
  basePriceCentavos: number;
  baseMonthlyIncomeCentavos: number;
  minYear: number;
  description: string;
}[] = [
  {
    id: 'asset_moto',
    name: 'Motocicleta Popular',
    type: 'Veículo',
    basePriceCentavos: 1800000,
    baseMonthlyIncomeCentavos: 0,
    minYear: 1960,
    description: 'Transporte ágil urbano com baixo custo de manutenção.',
  },
  {
    id: 'asset_carro',
    name: 'Automóvel Nacional',
    type: 'Veículo',
    basePriceCentavos: 6500000,
    baseMonthlyIncomeCentavos: 0,
    minYear: 1956,
    description: 'Veículo de passeio para mobilidade familiar.',
  },
  {
    id: 'asset_tesouro',
    name: 'Títulos Públicos / Renda Fixa',
    type: 'Investimento',
    basePriceCentavos: 1500000,
    baseMonthlyIncomeCentavos: 14000,
    minYear: 1920,
    description: 'Aplicação indexada à taxa básica de juros da economia.',
  },
  {
    id: 'asset_acoes',
    name: 'Carteira de Ações Nacionais',
    type: 'Investimento',
    basePriceCentavos: 4000000,
    baseMonthlyIncomeCentavos: 32000,
    minYear: 1945,
    description: 'Participação em empresas listadas, sensível ao ciclo do PIB.',
  },
  {
    id: 'asset_kitnet',
    name: 'Apartamento Compacto Urbano',
    type: 'Imóvel',
    basePriceCentavos: 22000000,
    baseMonthlyIncomeCentavos: 140000,
    minYear: 1930,
    description: 'Imóvel residencial com demanda estável de aluguel.',
  },
  {
    id: 'asset_casa',
    name: 'Casa Residencial Familiar',
    type: 'Imóvel',
    basePriceCentavos: 48000000,
    baseMonthlyIncomeCentavos: 280000,
    minYear: 1900,
    description: 'Patrimônio sólido residencial com valorização imobiliária.',
  },
  {
    id: 'asset_comercio',
    name: 'Sala Comercial / Ponto de Loja',
    type: 'Imóvel',
    basePriceCentavos: 36000000,
    baseMonthlyIncomeCentavos: 260000,
    minYear: 1900,
    description: 'Imóvel comercial gerador de renda recorrente.',
  },
];

/**
 * Connects macro economic state (WorldEconomyEngine + BrazilState) to micro player finances, asset yields, catalog pricing, and CPI upkeep.
 */
export class GlobalEconomicSimulationEngine {
  static getAssetCatalog(world: WorldState, cityName?: string): AssetCatalogItem[] {
    const year = world.clock.year;
    const cpiScale = Math.max(0.45, Math.min(2500, world.economy.costOfLivingMultiplier));
    const realEstateMult = Math.max(0.6, (world.economy.realEstateIndex || 100) / 100);
    const city = cityName
      ? Object.values(world.brazil.cities).find((c) => c.name === cityName)
      : undefined;
    const cityFactor = city ? Math.max(0.7, city.costOfLivingIndex / 100) : 1.0;

    return RAW_ASSET_TEMPLATES.filter((t) => year >= t.minYear).map((t) => {
      const typeScale =
        t.type === 'Imóvel' ? cpiScale * realEstateMult * cityFactor : cpiScale;
      const selicBoost =
        t.type === 'Investimento' ? Math.max(0.7, world.brazil.selicRate / 10) : 1.0;
      const priceCentavos = Math.max(50000, Math.round(t.basePriceCentavos * typeScale));
      const monthlyIncomeCentavos = Math.round(t.baseMonthlyIncomeCentavos * typeScale * selicBoost);

      return {
        id: t.id,
        name: t.name,
        type: t.type,
        priceCentavos,
        monthlyIncomeCentavos,
        minYear: t.minYear,
        description: t.description,
      };
    });
  }

  static calculateAnnualLivingCostCentavos(world: WorldState, age: number, cityName: string): number {
    if (age < 18) return 0;
    const city = Object.values(world.brazil.cities).find((c) => c.name === cityName);
    const cityFactor = city ? city.costOfLivingIndex / 100 : 1.0;
    const baseAnnualCentavos = 1200000;
    return Math.round(baseAnnualCentavos * world.economy.costOfLivingMultiplier * cityFactor);
  }

  static updateAssetsMarketValue(assets: Asset[], world: WorldState): Asset[] {
    const year = world.clock.year;
    const isHyperInflationEra = year < 1994 && world.brazil.annualInflationRate > 25;
    const inflationBoost = isHyperInflationEra
      ? Math.min(1.4, (world.brazil.annualInflationRate / 100) * 0.55)
      : Math.min(0.08, world.brazil.annualInflationRate / 300);
    const gdpFactor = world.brazil.gdpGrowthRate * 0.007;

    return assets.map((asset) => {
      if (asset.type === 'Imóvel') {
        const delta = gdpFactor + inflationBoost;
        return {
          ...asset,
          value: Math.max(100000, Math.round(asset.value * (1 + delta))),
          monthlyIncome: Math.round(asset.monthlyIncome * (1 + Math.max(0, delta * 0.7))),
        };
      }
      if (asset.type === 'Veículo') {
        const nominalChange = isHyperInflationEra ? inflationBoost * 0.5 - 0.06 : -0.08;
        return {
          ...asset,
          value: Math.max(50000, Math.round(asset.value * (1 + nominalChange))),
        };
      }
      if (asset.type === 'Investimento' || asset.type === 'Empresa') {
        const yieldPct = isHyperInflationEra
          ? inflationBoost * 0.75 + gdpFactor
          : Math.max(-0.04, world.brazil.selicRate / 100 - 0.01 + gdpFactor);
        return {
          ...asset,
          value: Math.max(50000, Math.round(asset.value * (1 + yieldPct))),
          monthlyIncome: Math.round(asset.monthlyIncome * (1 + Math.max(-0.03, yieldPct * 0.4))),
        };
      }
      return asset;
    });
  }

  static stepMacro(world: WorldState, year: number): void {
    WorldEconomyEngine.advanceYear(world, year);
  }

  static calculateMonthlyRentCentavos(world: WorldState, cityName?: string): number {
    const cpiScale = Math.max(0.45, Math.min(2500, world.economy.costOfLivingMultiplier));
    const realEstateMult = Math.max(0.6, (world.economy.realEstateIndex || 100) / 100);
    const city = cityName
      ? Object.values(world.brazil.cities).find((c) => c.name === cityName)
      : undefined;
    const cityFactor = city ? Math.max(0.7, city.costOfLivingIndex / 100) : 1.0;
    const baseRentCentavos = 85000; // R$ 850,00 base
    return Math.max(15000, Math.round(baseRentCentavos * cpiScale * realEstateMult * cityFactor));
  }

  static calculateRetirementPensionCentavos(
    salaryCentavos: number,
    inssYears: number,
    world: WorldState
  ): number {
    const minWageCentavos = (world.brazil.minimumWageNominal || 1412) * 100;
    const years = Math.max(15, inssYears);
    // INSS replacement rate: 60% + 2% per year above 15 years for women / 20 for men
    const replacementPct = Math.min(1.0, 0.60 + Math.max(0, years - 15) * 0.02);
    const calculated = Math.round(salaryCentavos * replacementPct);
    return Math.max(minWageCentavos, Math.min(Math.round(minWageCentavos * 5.5), calculated));
  }

  static canRetire(age: number, inssYears: number): { allowed: boolean; reason?: string } {
    if (age >= 65 || inssYears >= 30) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Necessário ter pelo menos 65 anos de idade (atual: ${age}) ou 30 anos de contribuição ao INSS (atual: ${inssYears}).`,
    };
  }
}
