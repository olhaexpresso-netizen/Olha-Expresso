import { CausalDomainMetrics, WorldState } from '../types/world';

/**
 * WorldCausalityEngine 12.0
 * Implements the continuous, closed-loop causal feedback pipeline:
 *
 * TECHNOLOGY
 *     ↓
 * PRODUTIVIDADE
 *     ↓
 * EMPRESAS E EMPREGOS
 *     ↓
 * RENDA E CONSUMO
 *     ↓
 * ECONOMIA REGIONAL
 *     ↓
 * MIGRAÇÃO E POPULAÇÃO
 *     ↓
 * CULTURA E SOCIEDADE
 *     ↓
 * POLÍTICA E INSTITUIÇÕES
 *     ↓
 * NOVAS POLÍTICAS E INVESTIMENTOS
 *     ↓
 * TECNOLOGIA E ECONOMIA
 *
 * Features mathematical dampeners, saturation sigmoids, and bounded state updates
 * to ensure persistent consequences while preventing runaway numerical oscillations.
 */
export class WorldCausalityEngine {
  private static readonly DAMPING_FACTOR = 0.82;

  static createInitialMetrics(
    techIndex = 50,
    realWageIndex = 100,
    institutionalTrust = 60,
    year = 2000
  ): CausalDomainMetrics {
    const base = this.createInitialCausalState(year);
    return {
      ...base,
      technologyIndex: techIndex,
      realWageIndex,
      institutionalStabilityIndex: institutionalTrust,
    };
  }

  static createInitialCausalState(year: number): CausalDomainMetrics {
    const devScale = Math.min(1, Math.max(0.15, (year - 1500) / 526));
    return {
      technologyIndex: Math.round(15 + devScale * 75),
      productivityIndex: Math.round(20 + devScale * 70),
      businessHealthIndex: 65,
      realWageIndex: 100,
      regionalVitalityIndex: Math.round(25 + devScale * 65),
      migrationPressureIndex: 40,
      socialCohesionIndex: 60,
      institutionalStabilityIndex: 62,
      policyFeedbackDelta: 0,
      lastCausalCycleTimestamp: Date.now(),
    };
  }

  static processCausalCycle(world: WorldState, year: number): CausalDomainMetrics {
    const prev = world.causality || this.createInitialCausalState(year);

    // 1. TECHNOLOGY DOMAIN
    const rawTech = (world.technology.globalTechIndex * 0.45) + (world.technology.brazilTechIndex * 0.55);
    const techInvestBonus = Math.max(-4, Math.min(6, prev.policyFeedbackDelta * 0.8));
    const technologyIndex = Number(
      Math.max(5, Math.min(100, prev.technologyIndex * (1 - this.DAMPING_FACTOR) + (rawTech + techInvestBonus) * this.DAMPING_FACTOR)).toFixed(2)
    );

    // 2. PRODUCTIVITY DOMAIN (Tech -> Infrastructure -> Productivity)
    const literacyFactor = (world.brazil.literacyRate ?? 75) / 100;
    const rawProductivity = technologyIndex * 0.65 + literacyFactor * 35;
    const productivityIndex = Number(
      Math.max(10, Math.min(100, prev.productivityIndex * 0.25 + rawProductivity * 0.75)).toFixed(2)
    );

    // 3. COMPANIES & JOBS (Productivity -> Business Health & Labor Demand)
    let activeCompanies = 0;
    const compLen = world.companies.length || 1;
    for (let i = 0; i < world.companies.length; i++) {
      const st = world.companies[i].status;
      if (st === 'Ativa' || st === 'Em Expansão') activeCompanies++;
    }
    const companyRatio = Math.min(1.2, activeCompanies / compLen);
    const gdpGrowthBonus = world.brazil.gdpGrowthRate * 1.8;
    const rawBusiness = productivityIndex * 0.55 + companyRatio * 35 + gdpGrowthBonus;
    const businessHealthIndex = Number(Math.max(15, Math.min(100, rawBusiness)).toFixed(2));

    // 4. INCOME & CONSUMPTION (Business Health -> Real Wages & Purchasing Power)
    const inflationDrag = Math.min(30, (world.brazil.annualInflationRate || 4) * 0.25);
    const taxDrag = Math.min(25, (world.brazil.baseTaxRatePct || 25) * 0.35);
    const rawRealWage = 100 + (businessHealthIndex - 50) * 0.45 - inflationDrag - (taxDrag - 8);
    const realWageIndex = Number(Math.max(30, Math.min(280, rawRealWage)).toFixed(2));
    world.brazil.realWageIndex = realWageIndex;

    // 5. REGIONAL ECONOMY (Income/Consumption -> Regional Vitality) — normalize 0..1 developmentIndex to 0..100
    const stateVals = Object.values(world.brazil.states || {});
    let devSum = 0;
    for (let i = 0; i < stateVals.length; i++) {
      const rawDev = stateVals[i].developmentIndex || 0.55;
      devSum += rawDev <= 1.5 ? rawDev * 100 : rawDev;
    }
    const avgDev = stateVals.length > 0 ? devSum / stateVals.length : 55;
    const rawRegional = avgDev * 0.6 + (realWageIndex / 100) * 40;
    const regionalVitalityIndex = Number(Math.max(20, Math.min(100, rawRegional)).toFixed(2));

    // 6. MIGRATION & POPULATION (Regional Disparity -> Migration Pressure)
    const urbanGrowthPull = (world.brazil.urbanizationRate || 80) * 0.4;
    const rawMigration = Math.abs(regionalVitalityIndex - 50) * 0.6 + urbanGrowthPull;
    const migrationPressureIndex = Number(Math.max(10, Math.min(100, rawMigration)).toFixed(2));

    // 7. CULTURE & SOCIETY (Demographics + Living Conditions -> Social Cohesion)
    const inequalityPenalty = (world.brazil.socialInequalityGini || 0.52) * 50;
    const povertyPenalty = (world.brazil.povertyRatePct || 20) * 0.65;
    const crimeDrag = world.crimeAndJustice ? (world.crimeAndJustice.nationalCrimeIndex - 40) * 0.2 : 0;
    const rawCohesion = 100 - inequalityPenalty - povertyPenalty - crimeDrag + (world.culture.socialValues?.civicParticipation ?? 50) * 0.3;
    const socialCohesionIndex = Number(Math.max(15, Math.min(100, rawCohesion)).toFixed(2));

    // 8. POLITICS & INSTITUTIONS (Social Cohesion -> Institutional Trust & Stability)
    const fiscalStress = (world.brazil.publicDebtPctGdp || 70) > 85 ? ((world.brazil.publicDebtPctGdp - 85) * 0.7) : 0;
    const auditBonus = world.governmentAdmin ? (world.governmentAdmin.corruptionAuditScore - 60) * 0.12 : 0;
    const rawInstitutions = socialCohesionIndex * 0.55 + (world.brazil.institutionalTrust || 55) * 0.45 - fiscalStress + auditBonus;
    const institutionalStabilityIndex = Number(Math.max(15, Math.min(100, rawInstitutions)).toFixed(2));
    world.brazil.institutionalTrust = Math.round(institutionalStabilityIndex * 0.9 + 5);

    // 9. NEW POLICIES & CAPITAL RE-INVESTMENT (Institutions -> Capital Feedback)
    const policyOrientationMultiplier =
      world.brazil.currentGovernment?.economicOrientation === 'Desenvolvimentista'
        ? 1.8
        : world.brazil.currentGovernment?.economicOrientation === 'Liberal'
          ? 0.9
          : 1.2;
    const fiscalRoom = Math.max(-3, (85 - (world.brazil.publicDebtPctGdp || 70)) * 0.12);
    const policyFeedbackDelta = Number(
      Math.max(-5, Math.min(5, ((institutionalStabilityIndex - 50) * 0.08 + fiscalRoom) * policyOrientationMultiplier)).toFixed(2)
    );

    // 10. RE-INJECT FEEDBACK INTO MACRO-TECH & ECONOMY WITH STABILIZERS
    if (policyFeedbackDelta > 0) {
      world.technology.brazilTechIndex = Number(
        Math.min(100, world.technology.brazilTechIndex + policyFeedbackDelta * 0.08).toFixed(2)
      );
    }

    const metrics: CausalDomainMetrics = {
      technologyIndex,
      productivityIndex,
      businessHealthIndex,
      realWageIndex,
      regionalVitalityIndex,
      migrationPressureIndex,
      socialCohesionIndex,
      institutionalStabilityIndex,
      policyFeedbackDelta,
      lastCausalCycleTimestamp: Date.now(),
    };

    world.causality = metrics;
    return metrics;
  }
}
