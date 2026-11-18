import {
  BrazilHistoricalPhaseId,
  SeasonName,
  WorldAdvanceUnit,
  WorldClock,
  WorldClockStep,
  WorldHistoricalEraId,
} from '../types/world';

const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;

export function resolveSeasonSouthernHemisphere(month: number): SeasonName {
  if (month === 12 || month === 1 || month === 2) return 'Verão';
  if (month >= 3 && month <= 5) return 'Outono';
  if (month >= 6 && month <= 8) return 'Inverno';
  return 'Primavera';
}

export function resolveHistoricalEra(year: number): { id: WorldHistoricalEraId; label: string } {
  if (year < 476) return { id: 'ANTIGUIDADE', label: 'Antiguidade' };
  if (year < 1453) return { id: 'IDADE_MEDIA', label: 'Idade Média' };
  if (year < 1789) return { id: 'IDADE_MODERNA', label: 'Idade Moderna' };
  if (year < 1900) return { id: 'CONTEMPORANEA', label: 'Idade Contemporânea (Séc. XIX)' };
  if (year < 2000) return { id: 'SECULO_XX', label: 'Século XX' };
  if (year <= 2026) return { id: 'SECULO_XXI', label: 'Século XXI (Contemporâneo)' };
  if (year <= 2060) return { id: 'FUTURO_PROXIMO', label: 'Futuro Próximo (Projeção)' };
  return { id: 'FUTURO_DISTANTE', label: 'Futuro Distante (Projeção)' };
}

export function resolveBrazilHistoricalPhase(year: number): {
  id: BrazilHistoricalPhaseId;
  label: string;
} {
  if (year < 1822) return { id: 'BRASIL_COLONIA', label: 'Brasil Colônia' };
  if (year < 1889) return { id: 'IMPERIO_DO_BRASIL', label: 'Império do Brasil' };
  if (year < 1930) return { id: 'PRIMEIRA_REPUBLICA', label: 'Primeira República (República Velha)' };
  if (year < 1946) return { id: 'ERA_VARGAS', label: 'Era Vargas' };
  if (year < 1964) return { id: 'REPUBLICA_POPULISTA', label: 'República Populista (1946–1964)' };
  if (year < 1985) return { id: 'REGIME_MILITAR', label: 'Regime Militar (1964–1985)' };
  if (year < 2000) return { id: 'NOVA_REPUBLICA', label: 'Nova República e Redemocratização' };
  if (year <= 2026) return { id: 'BRASIL_CONTEMPORANEO', label: 'Brasil Contemporâneo' };
  return { id: 'BRASIL_FUTURO_PROJETADO', label: 'Brasil Futuro (Projeção)' };
}

export class WorldClockEngine {
  static createClock(startYear: number, month = 1, day = 1): WorldClock {
    const safeYear = Math.max(-3000, Math.floor(startYear));
    const safeMonth = Math.min(12, Math.max(1, Math.floor(month)));
    const safeDay = Math.min(DAYS_PER_MONTH, Math.max(1, Math.floor(day)));
    const era = resolveHistoricalEra(safeYear);
    const br = resolveBrazilHistoricalPhase(safeYear);
    return {
      day: safeDay,
      month: safeMonth,
      year: safeYear,
      totalDaysElapsed: 0,
      totalMonthsElapsed: 0,
      decade: Math.floor(safeYear / 10) * 10,
      century: Math.floor((safeYear - 1) / 100) + 1,
      season: resolveSeasonSouthernHemisphere(safeMonth),
      era: era.id,
      eraLabel: era.label,
      brazilPhase: br.id,
      brazilPhaseLabel: br.label,
      tickCount: 0,
      lastTickId: `tick_${safeYear}_${safeMonth}_${safeDay}_0`,
    };
  }

  static unitToDays(unit: WorldAdvanceUnit): number {
    switch (unit) {
      case 'day':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return DAYS_PER_MONTH;
      case '6months':
        return DAYS_PER_MONTH * 6;
      case 'year':
        return DAYS_PER_MONTH * MONTHS_PER_YEAR;
      case '5years':
        return DAYS_PER_MONTH * MONTHS_PER_YEAR * 5;
      case '10years':
        return DAYS_PER_MONTH * MONTHS_PER_YEAR * 10;
      case '50years':
        return DAYS_PER_MONTH * MONTHS_PER_YEAR * 50;
      case '100years':
        return DAYS_PER_MONTH * MONTHS_PER_YEAR * 100;
      default:
        return DAYS_PER_MONTH * MONTHS_PER_YEAR;
    }
  }

  static buildPeriodKey(clock: WorldClock, unit: WorldAdvanceUnit): string {
    return `${clock.year}-${String(clock.month).padStart(2, '0')}-${String(clock.day).padStart(2, '0')}_t${clock.tickCount}_${unit}`;
  }

  static formatDateBR(clock: WorldClock): string {
    return `${String(clock.day).padStart(2, '0')}/${String(clock.month).padStart(2, '0')}/${clock.year}`;
  }

  static advance(clock: WorldClock, unit: WorldAdvanceUnit): WorldClockStep {
    const daysToAdvance = this.unitToDays(unit);
    const prev: WorldClock = { ...clock };

    const totalInitialDays =
      (clock.year * MONTHS_PER_YEAR + (clock.month - 1)) * DAYS_PER_MONTH + (clock.day - 1);
    const totalTargetDays = totalInitialDays + daysToAdvance;

    const nextDayZero = totalTargetDays % DAYS_PER_MONTH;
    const totalTargetMonths = Math.floor(totalTargetDays / DAYS_PER_MONTH);
    const nextMonthZero = totalTargetMonths % MONTHS_PER_YEAR;
    const nextYear = Math.floor(totalTargetMonths / MONTHS_PER_YEAR);

    const nextMonth = nextMonthZero + 1;
    const nextDay = nextDayZero + 1;

    const totalInitialMonths = clock.year * MONTHS_PER_YEAR + (clock.month - 1);
    const monthsDelta = totalTargetMonths - totalInitialMonths;

    const yearsCrossed: number[] = [];
    for (let y = clock.year + 1; y <= nextYear; y++) {
      yearsCrossed.push(y);
    }

    const monthsCrossed: number[] = [];
    for (let m = 1; m <= monthsDelta; m++) {
      const mVal = ((totalInitialMonths + m) % MONTHS_PER_YEAR) + 1;
      monthsCrossed.push(mVal);
    }

    const nextDecade = Math.floor(nextYear / 10) * 10;
    const decadesCrossed: number[] = [];
    for (let d = clock.decade + 10; d <= nextDecade; d += 10) {
      decadesCrossed.push(d);
    }

    const nextCentury = Math.floor((nextYear - 1) / 100) + 1;
    const centuriesCrossed: number[] = [];
    for (let c = clock.century + 1; c <= nextCentury; c++) {
      centuriesCrossed.push(c);
    }

    const era = resolveHistoricalEra(nextYear);
    const br = resolveBrazilHistoricalPhase(nextYear);
    const nextTick = clock.tickCount + 1;

    const current: WorldClock = {
      day: nextDay,
      month: nextMonth,
      year: nextYear,
      totalDaysElapsed: clock.totalDaysElapsed + daysToAdvance,
      totalMonthsElapsed: clock.totalMonthsElapsed + monthsDelta,
      decade: nextDecade,
      century: nextCentury,
      season: resolveSeasonSouthernHemisphere(nextMonth),
      era: era.id,
      eraLabel: era.label,
      brazilPhase: br.id,
      brazilPhaseLabel: br.label,
      tickCount: nextTick,
      lastTickId: `tick_${nextYear}_${nextMonth}_${nextDay}_${nextTick}`,
    };

    return {
      previous: prev,
      current,
      daysAdvanced: daysToAdvance,
      monthsCrossed,
      yearsCrossed,
      decadesCrossed,
      centuriesCrossed,
      periodKey: this.buildPeriodKey(prev, unit),
    };
  }
}
