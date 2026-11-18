import { EconomicCyclePhase, WorldEconomyState, WorldState } from '../types/world';

export class WorldEconomyEngine {
  static createInitialState(year: number): WorldEconomyState {
    const baseGdp =
      year < 1950
        ? 4500
        : year < 1980
          ? 18000
          : year < 2000
            ? 34000
            : year < 2020
              ? 85000
              : 105000;

    const costMultiplier =
      year < 1950
        ? 0.55
        : year < 1980
          ? 0.72
          : year < 2000
            ? 0.88
            : 1.0 + Math.max(0, year - 2020) * 0.02;

    return {
      cyclePhase: year === 2008 || year === 2020 ? 'Recessão' : 'Expansão',
      globalGdpBillionsUSD: baseGdp,
      globalGdpGrowthRate: year === 2008 || year === 2020 ? -2.8 : 3.1,
      globalInflationRate: year >= 1973 && year <= 1982 ? 9.5 : 3.4,
      globalUnemploymentRate: year === 2020 ? 8.1 : 5.4,
      commodityIndex: 100,
      techMarketIndex: year >= 1995 ? 125 : 80,
      realEstateIndex: 100,
      housingAffordabilityIndex: year < 2000 ? 74 : 56,
      energyPriceIndex: 100,
      costOfLivingMultiplier: Number(costMultiplier.toFixed(3)),
      creditAvailability: 68,
      creditInterestSpreadPct: year < 1994 ? 28.0 : 12.5,
      activeCrises:
        year === 2008
          ? ['Crise Financeira Global']
          : year === 2020
            ? ['Choque Pandêmico Global']
            : [],
    };
  }

  static advanceYear(world: WorldState, year: number): void {
    const econ = world.economy;
    const br = world.brazil;
    const techMultiplier = 1 + world.technology.globalTechIndex * 0.00018;

    const seedNum = world.seed.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, year);
    const wave = Math.sin(year * 0.65 + (seedNum % 7)) * 1.1;

    // 1. Global macro cycle
    const prevGrowth = econ.globalGdpGrowthRate;
    const rawGlobalGrowth = Math.max(-5.5, Math.min(6.8, prevGrowth * 0.55 + 1.45 * techMultiplier + wave));
    econ.globalGdpGrowthRate = Number(rawGlobalGrowth.toFixed(2));
    econ.globalGdpBillionsUSD = Number(
      Math.max(1000, econ.globalGdpBillionsUSD * (1 + econ.globalGdpGrowthRate / 100)).toFixed(1)
    );

    let nextPhase: EconomicCyclePhase = 'Expansão';
    if (econ.globalGdpGrowthRate < 0) nextPhase = 'Recessão';
    else if (econ.globalGdpGrowthRate < 1.8) nextPhase = 'Desaceleração';
    else if (econ.globalGdpGrowthRate > 4.0) nextPhase = 'Boom';
    else if (prevGrowth < 0.8 && econ.globalGdpGrowthRate >= 1.8) nextPhase = 'Recuperação';
    econ.cyclePhase = nextPhase;

    const targetGlobalInflation = year >= 1974 && year <= 1984 ? 8.0 : 3.2;
    econ.globalInflationRate = Number(
      Math.max(
        0.4,
        econ.globalInflationRate * 0.65 +
          targetGlobalInflation * 0.35 +
          (nextPhase === 'Boom' ? 0.6 : -0.2)
      ).toFixed(2)
    );
    econ.globalUnemploymentRate = Number(
      Math.max(3.2, Math.min(18.0, econ.globalUnemploymentRate - econ.globalGdpGrowthRate * 0.16 + 0.35)).toFixed(1)
    );

    // 2. Brazil causal fiscal + monetary feedback
    const orientationBonus =
      br.currentGovernment.economicOrientation === 'Desenvolvimentista'
        ? 0.45
        : br.currentGovernment.economicOrientation === 'Estabilização'
          ? 0.25
          : 0.15;
    const highDebtDrag = br.publicDebtPctGdp > 85 ? (br.publicDebtPctGdp - 85) * 0.04 : 0;

    const brGrowth = Math.max(
      -5.5,
      Math.min(
        7.5,
        econ.globalGdpGrowthRate * 0.72 +
          orientationBonus +
          wave * 0.65 -
          highDebtDrag -
          (br.annualInflationRate > 40 ? 1.8 : 0)
      )
    );
    br.gdpGrowthRate = Number(brGrowth.toFixed(2));
    br.gdpBillionsUSD = Number(Math.max(50, br.gdpBillionsUSD * (1 + br.gdpGrowthRate / 100)).toFixed(1));

    // Fiscal deficit/debt dynamics linked to growth & Selic
    const fiscalDrift = brGrowth < 1.0 ? 1.4 : -0.6;
    const interestPressure = br.selicRate > 12 ? 0.7 : -0.2;
    br.publicDebtPctGdp = Number(
      Math.max(18, Math.min(125, (br.publicDebtPctGdp ?? 62) + fiscalDrift + interestPressure)).toFixed(1)
    );
    br.baseTaxRatePct = Number(
      Math.max(
        10,
        Math.min(36, br.currentGovernment.baseTaxRatePct + (br.publicDebtPctGdp > 88 ? 1.5 : 0))
      ).toFixed(1)
    );

    // Inflation & Selic loop
    if (year >= 1985 && year <= 1993) {
      br.annualInflationRate = Number(Math.min(1950, Math.max(95, br.annualInflationRate * 1.05)).toFixed(1));
    } else if (year >= 1994) {
      const targetBrInflation = br.gdpGrowthRate > 4 ? 5.8 : 4.2;
      const debtRiskPremium = br.publicDebtPctGdp > 85 ? 1.1 : 0;
      br.annualInflationRate = Number(
        Math.max(
          1.8,
          Math.min(
            18,
            br.annualInflationRate * 0.62 +
              (targetBrInflation + debtRiskPremium) * 0.38 -
              (br.selicRate - 9) * 0.12
          )
        ).toFixed(2)
      );
    }

    const desiredSelic = year >= 1994 ? Math.max(3.5, Math.min(22, br.annualInflationRate * 1.45 + 3.2)) : 18.0;
    br.selicRate = Number((br.selicRate * 0.55 + desiredSelic * 0.45).toFixed(2));

    // Unemployment, real wages & poverty causality
    br.unemploymentRate = Number(
      Math.max(3.8, Math.min(20.5, br.unemploymentRate - br.gdpGrowthRate * 0.34 + 0.6)).toFixed(1)
    );

    const wageGrowthReal = br.gdpGrowthRate * 0.35 - Math.max(0, br.annualInflationRate - 6) * 0.12;
    br.realWageIndex = Number(
      Math.max(45, Math.min(180, (br.realWageIndex ?? 100) + wageGrowthReal)).toFixed(1)
    );
    br.povertyRatePct = Number(
      Math.max(
        4.5,
        Math.min(
          60,
          (br.povertyRatePct ?? 20) - br.gdpGrowthRate * 0.4 + Math.max(0, br.unemploymentRate - 9) * 0.25
        )
      ).toFixed(1)
    );

    // Nominal minimum wage adjustment (bounded to stay safe across reforms)
    const nominalWageIncrease =
      year < 1994
        ? Math.min(2.2, Math.max(0.05, br.annualInflationRate / 100))
        : Math.min(0.14, br.annualInflationRate / 100 + Math.max(0, br.gdpGrowthRate * 0.004));
    br.minimumWageNominal = Math.min(
      50_000_000,
      Math.max(50, Math.round(br.minimumWageNominal * (1 + nominalWageIncrease)))
    );

    if (year >= 1994) {
      const inflationSpread = (br.annualInflationRate - econ.globalInflationRate) / 100;
      br.exchangeRatePerUSD = Number(
        Math.max(1.0, Math.min(14.0, br.exchangeRatePerUSD * (1 + inflationSpread * 0.35))).toFixed(2)
      );
    }

    // Asset, housing affordability, credit spread & CPI
    const cpiStep =
      year < 1994
        ? 1 + Math.min(1.6, Math.max(0.02, (br.annualInflationRate / 100) * 0.65))
        : 1 + Math.min(0.12, Math.max(-0.02, (br.annualInflationRate / 100) * 0.55));
    econ.costOfLivingMultiplier = Number(Math.min(5000, Math.max(0.45, econ.costOfLivingMultiplier * cpiStep)).toFixed(3));

    econ.realEstateIndex = Number(
      Math.max(60, Math.min(500, econ.realEstateIndex * (1 + br.gdpGrowthRate * 0.008 + Math.min(0.06, br.annualInflationRate / 250)))).toFixed(1)
    );
    econ.housingAffordabilityIndex = Math.round(
      Math.max(18, Math.min(92, 82 - (econ.realEstateIndex - 100) * 0.22 - br.selicRate * 1.1 + (br.realWageIndex - 100) * 0.35))
    );
    econ.techMarketIndex = Number(
      Math.max(60, Math.min(1200, econ.techMarketIndex * (1 + world.technology.globalTechIndex * 0.0005 + econ.globalGdpGrowthRate * 0.006))).toFixed(1)
    );
    econ.creditAvailability = Math.round(Math.max(20, Math.min(95, 85 - br.selicRate * 2.1)));
    econ.creditInterestSpreadPct = Number(
      Math.max(4.5, Math.min(48, br.selicRate * 1.25 + (100 - econ.creditAvailability) * 0.12)).toFixed(1)
    );

    econ.activeCrises = [];
    if (econ.cyclePhase === 'Recessão') econ.activeCrises.push('Desaceleração Global');
    if (br.annualInflationRate > 12) econ.activeCrises.push('Pressão Inflacionária Alta no Brasil');
    if (br.unemploymentRate > 12.5) econ.activeCrises.push('Desemprego Elevado');
    if (br.publicDebtPctGdp > 90) econ.activeCrises.push('Pressão Fiscal sobre Dívida Pública');

    // Propagate macro to tracked countries
    for (const country of Object.values(world.countries)) {
      if (country.id === 'BRA') {
        country.gdpBillionsUSD = br.gdpBillionsUSD;
        country.gdpGrowthRate = br.gdpGrowthRate;
        country.inflationRate = br.annualInflationRate;
        country.unemploymentRate = br.unemploymentRate;
        country.interestRate = br.selicRate;
      } else {
        const cGrowth = Math.max(
          -4.5,
          Math.min(8.5, econ.globalGdpGrowthRate + (country.id === 'IND' || country.id === 'CHN' ? 1.4 : -0.2))
        );
        country.gdpGrowthRate = Number(cGrowth.toFixed(2));
        country.gdpBillionsUSD = Number(Math.max(50, country.gdpBillionsUSD * (1 + cGrowth / 100)).toFixed(1));
        country.inflationRate = Number(
          Math.max(0.5, country.inflationRate * 0.75 + econ.globalInflationRate * 0.25).toFixed(2)
        );
        country.unemploymentRate = Number(
          Math.max(2.5, Math.min(18, country.unemploymentRate - cGrowth * 0.15 + 0.3)).toFixed(1)
        );
      }
    }
  }
}
