import { GameSave } from '../types';
import { HistoricalEventRecord, WorldAdvanceUnit } from '../types/world';
import { WorldClockEngine } from './WorldClockEngine';
import { WorldStateEngine } from './WorldStateEngine';
import { WorldTechnologyEngine } from './WorldTechnologyEngine';
import { BrazilHistoricalSimulationEngine } from './BrazilHistoricalSimulationEngine';
import { WorldPoliticsEngine } from './WorldPoliticsEngine';
import { HistoricalEventEngine } from './HistoricalEventEngine';
import { WorldEconomyEngine } from './WorldEconomyEngine';
import { GlobalEconomicSimulationEngine } from './GlobalEconomicSimulationEngine';
import { WorldEnvironmentEngine } from './WorldEnvironmentEngine';
import { WorldInstitutionEngine } from './WorldInstitutionEngine';
import { WorldCultureEngine } from './WorldCultureEngine';
import { GlobalBusinessEvolutionEngine } from './GlobalBusinessEvolutionEngine';
import { WorldPopulationEngine } from './WorldPopulationEngine';
import { WorldConsistencyValidator } from './WorldConsistencyValidator';
import { WorldCausalityEngine } from './WorldCausalityEngine';
import { WorldGeographyEngine } from './WorldGeographyEngine';
import { CrimeAndJusticeEngine } from './CrimeAndJusticeEngine';
import { GovernanceAndPoliticsEngine } from './GovernanceAndPoliticsEngine';
import { CivilizationSystemsEngine } from './CivilizationSystemsEngine';
import { EventCatalogEngine } from './EventCatalogEngine';
import { GuardianDecisionEngine } from './GuardianDecisionEngine';

export interface AdvanceSimulationOutcome {
  save: GameSave;
  idempotentReplay: boolean;
  yearsAdvanced: number;
  monthsAdvanced: number;
  daysAdvanced: number;
  triggeredHistoricalEvents: HistoricalEventRecord[];
  familyNotes: string[];
}

export class WorldEvolutionEngine {
  static advanceTime(
    inputSave: GameSave,
    unit: WorldAdvanceUnit,
    clientIdempotencyKey?: string,
    autoContinueDynasty = false,
    skipValidation = false
  ): AdvanceSimulationOutcome {
    const save = skipValidation
      ? inputSave
      : WorldStateEngine.ensureSaveMigrated(inputSave, true);
    const world = save.worldState!;

    const effectiveKey =
      clientIdempotencyKey || WorldClockEngine.buildPeriodKey(world.clock, unit);

    if (world.processedPeriodKeys.includes(effectiveKey)) {
      return {
        save,
        idempotentReplay: true,
        yearsAdvanced: 0,
        monthsAdvanced: 0,
        daysAdvanced: 0,
        triggeredHistoricalEvents: [],
        familyNotes: [],
      };
    }

    if (save.character.status === 'Morto' && !autoContinueDynasty) {
      throw new Error(
        'O personagem faleceu. Escolha um herdeiro para continuar a dinastia ou inicie uma nova vida.'
      );
    }

    const step = WorldClockEngine.advance(world.clock, unit);
    world.clock = step.current;

    const triggeredHistoricalEvents: HistoricalEventRecord[] = [];
    const familyNotes: string[] = [];
    let actualYearsProcessed = 0;

    if (step.yearsCrossed.length === 0) {
      const char = save.character;
      const monthsDelta = step.monthsCrossed.length;
      if (monthsDelta > 0) {
        char.ageMonths = (char.ageMonths ?? char.currentAge * 12) + monthsDelta;
        char.currentAge = Math.floor(char.ageMonths / 12);

        if (char.currentAge >= 18 && char.status !== 'Preso' && char.criminalRecord.prisonYearsRemaining <= 0) {
          const taxRate = Math.min(0.45, (world.brazil.baseTaxRatePct ?? 20) / 100);
          const grossMonthly = char.isRetired ? (char.pensionCentavos || 0) / 12 : char.salary / 12;
          const monthlyTax = char.isRetired ? 0 : Math.round(grossMonthly * taxRate);
          const monthlyNetSalary = Math.round(grossMonthly) - monthlyTax;
          const annualLiving = GlobalEconomicSimulationEngine.calculateAnnualLivingCostCentavos(
            world,
            char.currentAge,
            char.city
          );
          const monthlyLiving = Math.round(annualLiving / 12);
          const monthlyRent = char.housingStatus === 'Aluguel' ? (char.monthlyRentCentavos || 0) : 0;
          const assetMonthly = save.assets.reduce((acc, a) => acc + a.monthlyIncome, 0);
          char.money += (monthlyNetSalary + assetMonthly - monthlyLiving - monthlyRent) * monthsDelta;
          if (char.banking) {
            char.banking.totalTaxesPaidCentavos += monthlyTax * monthsDelta;
            // Monthly loan payments & savings interest
            for (let m = 0; m < monthsDelta; m++) {
              this.settleMonthlyBanking(save, world.brazil.selicRate);
            }
          }
        }

        if (char.currentEducation && char.educationProgress < 100) {
          char.educationProgress = Math.min(100, char.educationProgress + monthsDelta * 2);
          if (char.educationProgress >= 100) {
            this.completeEducation(save, world.clock.year);
          }
        }

        for (let i = 0; i < save.family.length; i++) {
          const f = save.family[i];
          if (!f.alive) continue;
          const nextMonths = (f.ageMonths ?? f.age * 12) + monthsDelta;
          f.ageMonths = nextMonths;
          f.age = Math.floor(nextMonths / 12);
        }
      }
    } else {
      const isLongBatch = step.yearsCrossed.length > 10;

      for (const year of step.yearsCrossed) {
        let char = save.character;
        if (char.status === 'Morto') {
          if (autoContinueDynasty) {
            let heir =
              save.family.find((f) => f.alive && (f.relation === 'Filho' || f.relation === 'Filha')) ||
              save.family.find((f) => f.alive && (f.relation === 'Neto' || f.relation === 'Neta')) ||
              save.family.find((f) => f.alive && (f.relation === 'Bisneto' || f.relation === 'Bisneta')) ||
              save.family.find((f) => f.alive);
            if (!heir) {
              const collateralId = `fam_kin_${year}_${save.family.length}`;
              const kinAge = 24;
              const isFem = (year + save.family.length) % 2 === 1;
              heir = {
                id: collateralId,
                characterId: char.id,
                name: `${isFem ? 'Clara' : 'Henrique'} ${char.lastName}`,
                relation: isFem ? 'Prima' : 'Primo',
                age: kinAge,
                ageMonths: kinAge * 12,
                birthYear: year - kinAge,
                alive: true,
                relationship: 78,
                occupation: 'Profissional Autônomo',
                city: char.city,
                generation: char.generation || 1,
                gender: isFem ? 'Feminino' : 'Masculino',
                appearanceSeed: `${save.id}_${collateralId}`,
              };
              save.family.push(heir);
            }
            WorldPopulationEngine.transferLegacyToHeir(save, heir.id);
            char = save.character;
          } else {
            break;
          }
        }

        actualYearsProcessed++;
        const prevCurrency = world.brazil.currency;

        // 1. World subsystems advance in causal order
        world.technology = WorldTechnologyEngine.advanceYear(world.technology, year);
        world.brazil = BrazilHistoricalSimulationEngine.advanceYear(world.brazil, year, world.seed);

        // 2. Monetary reform conversion BEFORE macro-economy updates nominal rates cleanly
        BrazilHistoricalSimulationEngine.applyMonetaryReformIfCrossed(
          save,
          prevCurrency,
          world.brazil.currency,
          year
        );

        WorldPoliticsEngine.advanceYear(world, year);

        const histResult = HistoricalEventEngine.processYearEvents(world, year);
        if (histResult.triggeredEvents.length > 0) {
          triggeredHistoricalEvents.push(...histResult.triggeredEvents);
        }

        WorldEconomyEngine.advanceYear(world, year);
        const disaster = WorldEnvironmentEngine.advanceYear(world, year);
        WorldInstitutionEngine.advanceYear(world, year);
        WorldCultureEngine.advanceYear(world, year);
        GlobalBusinessEvolutionEngine.advanceYear(world, year);
        WorldPopulationEngine.advanceMacroPopulationYear(world, year);

        // V13 Domain Systems: Crime/Justice, Governance & Civilization (Religions, Wars, Conservation)
        const justiceNotes = CrimeAndJusticeEngine.advanceYear(save, year);
        const govNotes = GovernanceAndPoliticsEngine.advanceYear(save, year);
        CivilizationSystemsEngine.advanceYear(world, year);

        // V12/V13 Closed-Loop Causality
        WorldCausalityEngine.processCausalCycle(world, year);

        // Active treaties & conflicts synced cleanly (cities already advanced inside BrazilHistoricalSimulationEngine)
        world.activeTreaties = WorldGeographyEngine.getActiveTreaties(year);
        world.activeConflicts = WorldGeographyEngine.getActiveConflicts(year);

        if (disaster) {
          world.economy.costOfLivingMultiplier = Number(
            Math.min(5000, world.economy.costOfLivingMultiplier * 1.015).toFixed(3)
          );
          if (disaster.severity === 'Extremo') {
            char.health = Math.max(10, char.health - 2);
            char.happiness = Math.max(5, char.happiness - 4);
            char.mentalHealth = Math.max(10, (char.mentalHealth ?? 75) - 3);
          }
        }

        // Epidemic risk modulated by vaccination & health insurance
        if (world.brazil.activeEpidemic) {
          const isVaccinated = char.vaccinatedYears?.some((vy) => year - vy <= 2);
          if (!isVaccinated && world.brazil.activeEpidemic.severity > 45) {
            const penalty = char.insurance?.health ? 1 : 3;
            char.health = Math.max(15, char.health - penalty);
          }
        }

        // 3. Character lifecycle for this year
        char.currentAge += 1;
        char.ageMonths = char.currentAge * 12 + (world.clock.month - 1);

        if (char.currentAge <= 17) {
          GuardianDecisionEngine.simulateGuardianDecisionIfNeeded(save);
        }

        if (histResult.playerHappinessDelta !== 0) {
          char.happiness = Math.max(0, Math.min(100, char.happiness + histResult.playerHappinessDelta));
        }
        if (histResult.playerHealthDelta !== 0) {
          char.health = Math.max(5, Math.min(100, char.health + histResult.playerHealthDelta));
        }

        // Handle Justice & Prison Notes
        for (const jn of justiceNotes) {
          save.events.push({
            id: `evt_just_${year}_${save.events.length}`,
            characterId: char.id,
            age: char.currentAge,
            year,
            title: 'Andamento Policial / Judicial',
            description: jn,
            category: 'Justiça e sistema prisional',
            truthStatus: year <= 2026 ? 'SIMULATED_EVENT' : 'FUTURE_PROJECTION',
          });
        }
        for (const gn of govNotes) {
          save.events.push({
            id: `evt_gov_${year}_${save.events.length}`,
            characterId: char.id,
            age: char.currentAge,
            year,
            title: 'Acontecimento Político & Mandato',
            description: gn,
            category: 'Política e eleições',
            truthStatus: year <= 2026 ? 'SIMULATED_EVENT' : 'FUTURE_PROJECTION',
          });
        }

        if (char.criminalRecord.prisonYearsRemaining > 0) {
          char.status = 'Preso';
          char.criminalRecord.prisonYearsRemaining -= 1;
          if (char.criminalRecord.prisonYearsRemaining <= 0) {
            char.status = 'Vivo';
            if (char.justice) char.justice.prisonRegime = 'Livre';
          }
          if (!isLongBatch || char.criminalRecord.prisonYearsRemaining <= 0) {
            save.events.push({
              id: `evt_prison_${year}_${save.events.length}`,
              characterId: char.id,
              age: char.currentAge,
              year,
              title:
                char.criminalRecord.prisonYearsRemaining <= 0
                  ? 'Liberdade Conquistada'
                  : 'Ano na Penitenciária',
              description:
                char.criminalRecord.prisonYearsRemaining <= 0
                  ? 'Você cumpriu integralmente sua pena e recuperou a liberdade.'
                  : `Mais um ano cumprindo pena (${char.justice?.prisonRegime || 'Fechado'}). Restam ${char.criminalRecord.prisonYearsRemaining} ano(s).`,
              category: 'Justiça e sistema prisional',
              truthStatus: year <= 2026 ? 'SIMULATED_EVENT' : 'FUTURE_PROJECTION',
            });
          }
        } else {
          // Net financial year settlement with tax rate, rent, insurance, loans, savings & inflation
          if (char.currentAge >= 18) {
            const taxRate = Math.min(0.45, (world.brazil.baseTaxRatePct ?? 20) / 100);
            const grossSalary = char.isRetired ? 0 : char.salary;
            const annualTax = Math.round(grossSalary * taxRate);
            const netSalary = grossSalary - annualTax;
            const pensionIncome = char.isRetired ? (char.pensionCentavos || 0) : 0;
            const rentCost = char.housingStatus === 'Aluguel' ? (char.monthlyRentCentavos || 0) * 12 : 0;
            const insuranceCost =
              ((char.insurance?.health ? 360000 : 0) + (char.insurance?.life ? 180000 : 0)) *
              Math.max(0.5, Math.min(10, world.economy.costOfLivingMultiplier || 1));
            const annualLiving = GlobalEconomicSimulationEngine.calculateAnnualLivingCostCentavos(
              world,
              char.currentAge,
              char.city
            );
            const assetAnnual = save.assets.reduce((acc, a) => acc + a.monthlyIncome * 12, 0);
            char.money += Math.round(netSalary + pensionIncome + assetAnnual - annualLiving - rentCost - insuranceCost);

            if (char.banking) {
              char.banking.totalTaxesPaidCentavos += annualTax;
              // 12 monthly settlements for savings yield & loan repayments
              const annualYield = Math.max(0.02, (world.brazil.selicRate || 10) / 100 * 0.72);
              char.banking.savingsCentavos = Math.round(char.banking.savingsCentavos * (1 + annualYield));
              this.settleAnnualLoans(save);
              char.banking.inDefault = char.money < -50000;
            }

            if (char.money < 0) {
              const interestRate = (world.economy.creditInterestSpreadPct ?? 14) / 100;
              char.money = Math.round(char.money * (1 + Math.min(0.35, interestRate * 0.5)));
            }
          }

          if (char.careerTitle && !char.isRetired) {
            char.careerExperienceYears += 1;
            char.inssContributionYears = (char.inssContributionYears || 0) + 1;
            char.careerSkill = Math.min(100, char.careerSkill + 2);
            const wageAdjust =
              year < 1994 && world.brazil.annualInflationRate > 25
                ? Math.min(1.8, (world.brazil.annualInflationRate / 100) * 0.65)
                : Math.min(0.08, Math.max(0, world.brazil.annualInflationRate / 250));
            char.salary = Math.round(char.salary * (1 + wageAdjust));
          }

          save.assets = GlobalEconomicSimulationEngine.updateAssetsMarketValue(save.assets, world);

          if (char.careerCompany && world.brazil.gdpGrowthRate < -2.5 && (char.politics?.office ?? 'Nenhum') === 'Nenhum') {
            const comp = world.companies.find((c) => c.name === char.careerCompany);
            if (comp && (comp.status === 'Em Crise' || comp.status === 'Faliu')) {
              const roll = Math.abs((year * 17 + char.currentAge * 13) % 100);
              if (comp.status === 'Faliu' || roll < 22) {
                const prevJob = char.careerTitle;
                char.careerTitle = undefined;
                char.careerCompany = undefined;
                char.salary = 0;
                char.happiness = Math.max(5, char.happiness - 10);
                char.mentalHealth = Math.max(15, (char.mentalHealth ?? 75) - 6);
                save.events.push({
                  id: `evt_layoff_${year}`,
                  characterId: char.id,
                  age: char.currentAge,
                  year,
                  title: 'Demissão por Retração Econômica',
                  description: `Em meio à retração de ${year}, ${comp.name} reduziu quadros e você perdeu o cargo de ${prevJob}.`,
                  category: 'Carreiras e trabalho',
                  truthStatus: year <= 2026 ? 'SIMULATED_EVENT' : 'FUTURE_PROJECTION',
                });
              }
            }
          }

          if (char.currentEducation && char.educationProgress < 100) {
            char.educationProgress = Math.min(100, char.educationProgress + 25);
            if (char.educationProgress >= 100) {
              this.completeEducation(save, year);
            }
          }
        }

        // Trigger occasional catalog event automatically on short interactive steps
        if (!isLongBatch && year % 2 === 0 && char.currentAge >= 6 && save.events.filter((e) => e.year === year).length === 0) {
          const catDef = EventCatalogEngine.pickContextualEventForSave(save);
          if (catDef) {
            if (!world.triggeredCatalogEventIds) world.triggeredCatalogEventIds = [];
            world.triggeredCatalogEventIds.push(catDef.id);
            save.events.push(EventCatalogEngine.toLifeEvent(catDef, save));
          }
        }

        if (autoContinueDynasty && char.status !== 'Morto') {
          if (
            char.currentAge >= 25 &&
            char.currentAge <= 38 &&
            !save.family.some((f) => f.relation === 'Cônjuge' && f.alive)
          ) {
            const spouse = WorldPopulationEngine.createSpouse(save, year);
            save.family.push(spouse);
            char.partnerId = spouse.id;
          }
          if (
            char.currentAge >= 27 &&
            char.currentAge <= 42 &&
            !save.family.some((f) => (f.relation === 'Filho' || f.relation === 'Filha') && f.alive)
          ) {
            try {
              const child = WorldPopulationEngine.createChild(save, year);
              save.family.push(child);
            } catch {
              // ignore if biological bounds disallow
            }
          }
        }

        const famYearNotes = WorldPopulationEngine.advanceFamilyOneYear(save, year);
        if (!isLongBatch) familyNotes.push(...famYearNotes);

        const lifeExp = world.brazil.lifeExpectancy;
        if (char.currentAge > Math.max(45, lifeExp - 22)) {
          const wear = char.currentAge > lifeExp + 5 ? 4 : 2;
          char.health = Math.max(0, char.health - wear);
        }

        const shouldDie =
          char.health <= 0 ||
          (char.currentAge > lifeExp + 18 && (year + char.currentAge) % 4 === 0) ||
          char.currentAge >= 108;

        if (shouldDie) {
          char.status = 'Morto';
          char.causeOfDeath =
            char.currentAge >= 85
              ? 'Causas naturais da idade avançada'
              : 'Complicações graves de saúde';
          save.events.push({
            id: `evt_death_${year}`,
            characterId: char.id,
            age: char.currentAge,
            year,
            title: 'Fim da Jornada',
            description: `Aos ${char.currentAge} anos (em ${year}), ${char.firstName} ${char.lastName} faleceu devido a ${char.causeOfDeath}.`,
            category: 'Geral',
            truthStatus: year <= 2026 ? 'SIMULATED_EVENT' : 'FUTURE_PROJECTION',
          });
          save.history.push({
            age: char.currentAge,
            year,
            summary: `Faleceu aos ${char.currentAge} anos (${char.causeOfDeath}).`,
            worldSummary: `${world.brazil.phaseLabel} · PIB BR ${world.brazil.gdpGrowthRate}%`,
          });

          if (!autoContinueDynasty) {
            world.clock = WorldClockEngine.createClock(year, world.clock.month, world.clock.day);
            break;
          }
        }

        if (histResult.triggeredEvents.length > 0 && step.yearsCrossed.length <= 2) {
          const topHist = histResult.triggeredEvents[0];
          save.events.push({
            id: `evt_world_${topHist.id}_${year}`,
            characterId: char.id,
            age: char.currentAge,
            year,
            title: `Marco Histórico: ${topHist.title}`,
            description: topHist.summary,
            category: 'História mundial e brasileira',
            truthStatus: topHist.truthStatus,
            worldContextNote: `Governo no Brasil: ${world.brazil.currentGovernment.leaderName} · Moeda: ${world.brazil.currency.name}`,
          });
        }

        const histNote =
          histResult.triggeredEvents.length > 0
            ? ` | Mundo: ${histResult.triggeredEvents[0].title}`
            : '';
        if (
          step.yearsCrossed.length <= 5 ||
          year % 5 === 0 ||
          year === step.yearsCrossed[step.yearsCrossed.length - 1]
        ) {
          save.history.push({
            age: char.currentAge,
            year,
            summary: `Completou ${char.currentAge} anos em ${char.city}.${famYearNotes[0] ? ` ${famYearNotes[0]}` : ''}${histNote}`,
            worldSummary: `${world.brazil.currentGovernment.leaderName} · Inflação ${world.brazil.annualInflationRate}% · PIB ${world.brazil.gdpGrowthRate}%`,
          });
        }
      }
    }

    world.processedPeriodKeys.push(effectiveKey);
    if (world.processedPeriodKeys.length > 300) {
      world.processedPeriodKeys = world.processedPeriodKeys.slice(-300);
    }
    if (world.triggeredCatalogEventIds && world.triggeredCatalogEventIds.length > 300) {
      world.triggeredCatalogEventIds = world.triggeredCatalogEventIds.slice(-300);
    }
    if (save.events.length > 180) {
      save.events = save.events.slice(-180);
    }
    if (save.history.length > 350) {
      save.history = save.history.slice(-350);
    }

    save.updatedAt = Date.now();
    if (!skipValidation) {
      WorldConsistencyValidator.validateAndSanitize(save);
    }

    return {
      save,
      idempotentReplay: false,
      yearsAdvanced: actualYearsProcessed,
      monthsAdvanced: step.monthsCrossed.length,
      daysAdvanced: step.daysAdvanced,
      triggeredHistoricalEvents,
      familyNotes,
    };
  }

  private static settleMonthlyBanking(save: GameSave, selicRate: number): void {
    const banking = save.character.banking;
    if (!banking) return;
    if (banking.savingsCentavos > 0) {
      const monthlyRate = Math.max(0.002, (selicRate / 100 / 12) * 0.72);
      banking.savingsCentavos = Math.round(banking.savingsCentavos * (1 + monthlyRate));
    }
    const remainingLoans: typeof banking.loans = [];
    for (const loan of banking.loans) {
      const payment = Math.min(loan.remainingCentavos, loan.monthlyInstallmentCentavos);
      if (save.character.money >= payment) {
        save.character.money -= payment;
        loan.remainingCentavos -= payment;
        loan.remainingMonths = Math.max(0, loan.remainingMonths - 1);
        save.character.debtCentavos = Math.max(0, (save.character.debtCentavos || 0) - payment);
        banking.creditScore = Math.min(1000, banking.creditScore + 2);
      } else {
        banking.inDefault = true;
        banking.creditScore = Math.max(150, banking.creditScore - 15);
      }
      if (loan.remainingCentavos > 0 && loan.remainingMonths > 0) {
        remainingLoans.push(loan);
      }
    }
    banking.loans = remainingLoans;
  }

  private static settleAnnualLoans(save: GameSave): void {
    const banking = save.character.banking;
    if (!banking || banking.loans.length === 0) return;
    const remainingLoans: typeof banking.loans = [];
    for (const loan of banking.loans) {
      const monthsPay = Math.min(12, loan.remainingMonths);
      const annualInstallment = Math.min(loan.remainingCentavos, loan.monthlyInstallmentCentavos * monthsPay);
      if (save.character.money >= annualInstallment) {
        save.character.money -= annualInstallment;
        loan.remainingCentavos -= annualInstallment;
        loan.remainingMonths -= monthsPay;
        save.character.debtCentavos = Math.max(0, (save.character.debtCentavos || 0) - annualInstallment);
        banking.creditScore = Math.min(1000, banking.creditScore + 10);
      } else {
        banking.inDefault = true;
        banking.creditScore = Math.max(150, banking.creditScore - 25);
      }
      if (loan.remainingCentavos > 0 && loan.remainingMonths > 0) {
        remainingLoans.push(loan);
      }
    }
    banking.loans = remainingLoans;
  }

  /**
   * Advances multi-century dynasty simulation (e.g. 500y or 1000y) efficiently in optimized 100-year blocks
   * with automatic succession to living heirs and single final consistency reconciliation.
   */
  static advanceDynastyYears(inputSave: GameSave, totalYears: number): AdvanceSimulationOutcome {
    let save = WorldStateEngine.ensureSaveMigrated(inputSave, true);
    let yearsDone = 0;
    let guard = 0;
    const allHist: HistoricalEventRecord[] = [];
    const allFam: string[] = [];

    while (yearsDone < totalYears && guard < totalYears + 10) {
      guard += 1;
      const remaining = totalYears - yearsDone;
      const unit: WorldAdvanceUnit =
        remaining >= 100
          ? '100years'
          : remaining >= 50
            ? '50years'
            : remaining >= 10
              ? '10years'
              : remaining >= 5
                ? '5years'
                : 'year';
      const res = this.advanceTime(save, unit, undefined, true, true);
      save = res.save;
      yearsDone += res.yearsAdvanced;
      if (res.triggeredHistoricalEvents.length > 0) {
        allHist.push(...res.triggeredHistoricalEvents.slice(-5));
      }
      if (res.familyNotes.length > 0) {
        allFam.push(...res.familyNotes.slice(-5));
      }
      if (res.yearsAdvanced === 0) break;
    }

    WorldConsistencyValidator.validateAndSanitize(save);

    return {
      save,
      idempotentReplay: false,
      yearsAdvanced: yearsDone,
      monthsAdvanced: yearsDone * 12,
      daysAdvanced: yearsDone * 360,
      triggeredHistoricalEvents: allHist.slice(-20),
      familyNotes: allFam.slice(-20),
    };
  }

  private static completeEducation(save: GameSave, year: number): void {
    const char = save.character;
    const course = char.currentEducation || 'Estudos';
    if (course.includes('Pós-graduação')) char.educationLevel = 'Pós-graduação';
    else if (course.includes('Universidade')) char.educationLevel = 'Universidade';
    else if (course.includes('Médio')) char.educationLevel = 'Médio';
    else if (course.includes('Fundamental')) char.educationLevel = 'Fundamental';

    char.intelligence = Math.min(100, char.intelligence + 8);
    char.currentEducation = undefined;
    char.educationProgress = 0;

    save.events.push({
      id: `evt_grad_${year}_${save.events.length}`,
      characterId: char.id,
      age: char.currentAge,
      year,
      title: 'Formatura Concluída!',
      description: `Você concluiu ${course} em ${year}, abrindo novas oportunidades profissionais.`,
      category: 'Educação e formação',
      truthStatus: year <= 2026 ? 'SIMULATED_EVENT' : 'FUTURE_PROJECTION',
    });
  }
}
