import { CharacterAppearance } from '../types';
import { createSeededRng } from './CharacterAppearanceGenerator';
import { HairColorDef, HairStyleDef, findHairColor, findHairStyle } from './CharacterHairLibrary';

export interface HairGenetics {
  grayOnsetYears: number; // 34..64
  graySpeed: number; // 0.025..0.065 per year
  whiteConversionStartYears: number; // 62..86
  maxGrayFactor: number; // 0.78..1.0
  thinningOnsetYears: number; // 38..74
  thinningIntensity: number; // 0.08..0.85
  recedingPredisposition: number; // 0..1
  baldnessPredisposition: number; // 0..1
  infantHairDensity: number; // 0.15..0.95
  beardEarlyGrayOffsetYears: number; // 2..7 years earlier than scalp
}

export interface HairAgingResult {
  genetics: HairGenetics;
  grayFactor: number; // 0..1
  whiteDominance: number; // 0..1
  eyebrowGrayFactor: number; // 0..1
  beardGrayFactor: number; // 0..1
  thinningFactor: number; // 0..0.88 (reduces density / opacity)
  recedingLevel: number; // 0..1 (temples receding)
  crownBaldness: number; // 0..1 (0 = full, 0.5 = partial crown, 0.9+ = near bald)
  babyHairPhase: 'newborn' | 'infant' | 'toddler' | 'mature';
  babyHairScale: number; // 0.25..1.0
  effectiveHairStyle: HairStyleDef;
  resolvedHairHex: string;
  resolvedHairHighlightHex: string;
  resolvedHairShadowHex: string;
  resolvedEyebrowHex: string;
  resolvedBeardHex: string;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function blendHex(hexA: string, hexB: string, factor: number): string {
  const f = clamp01(factor);
  if (f <= 0.01) return hexA;
  const a = hexA.replace('#', '');
  const b = hexB.replace('#', '');
  if (a.length !== 6 || b.length !== 6) return hexA;

  const r1 = parseInt(a.slice(0, 2), 16);
  const g1 = parseInt(a.slice(2, 4), 16);
  const b1 = parseInt(a.slice(4, 6), 16);

  const r2 = parseInt(b.slice(0, 2), 16);
  const g2 = parseInt(b.slice(2, 4), 16);
  const b2 = parseInt(b.slice(4, 6), 16);

  const nr = Math.round(r1 + (r2 - r1) * f);
  const ng = Math.round(g1 + (g2 - g1) * f);
  const nb = Math.round(b1 + (b2 - b1) * f);

  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
}

export class HairAgingEngine {
  static deriveHairGenetics(
    appearanceSeed: string,
    gender: 'Masculino' | 'Feminino' | 'Outro' = 'Masculino'
  ): HairGenetics {
    const rng = createSeededRng(`${appearanceSeed}_hair_genetics_v9`);
    const maleWeight = gender === 'Masculino' ? 1.0 : gender === 'Outro' ? 0.45 : 0.14;

    return {
      grayOnsetYears: 34 + rng() * 28, // 34..62
      graySpeed: 0.025 + rng() * 0.038,
      whiteConversionStartYears: 62 + rng() * 22, // 62..84
      maxGrayFactor: 0.8 + rng() * 0.2,
      thinningOnsetYears: 38 + rng() * 34, // 38..72
      thinningIntensity: 0.12 + rng() * 0.65 * (0.45 + 0.55 * maleWeight),
      recedingPredisposition: rng() * maleWeight,
      baldnessPredisposition: rng() * maleWeight,
      infantHairDensity: 0.18 + rng() * 0.77,
      beardEarlyGrayOffsetYears: 2 + rng() * 5,
    };
  }

  static applyGrayAndWhiteToHex(hex: string, grayFactor: number, whiteDominance: number): string {
    if (grayFactor <= 0.01 && whiteDominance <= 0.01) return hex;
    const silverHex = '#9CA3AF';
    const whiteHex = '#E5E7EB';
    const withSilver = blendHex(hex, silverHex, grayFactor);
    return blendHex(withSilver, whiteHex, whiteDominance * 0.88);
  }

  static calculateHairAging(
    ageMonths: number,
    appearance: CharacterAppearance,
    gender: 'Masculino' | 'Feminino' | 'Outro' = 'Masculino'
  ): HairAgingResult {
    const safeMonths = Math.max(0, Math.min(1440, ageMonths));
    const ageYears = safeMonths / 12;
    const genetics = this.deriveHairGenetics(appearance.appearanceSeed || appearance.characterId, gender);

    const baseStyle = findHairStyle(appearance.hairStyle);
    const baseColor: HairColorDef = findHairColor(appearance.hairColor);

    // 1. Graying & White progression (individualized!)
    let grayFactor = 0;
    if (ageYears > genetics.grayOnsetYears) {
      const yearsSinceOnset = ageYears - genetics.grayOnsetYears;
      grayFactor = Math.min(genetics.maxGrayFactor, 1 - Math.exp(-yearsSinceOnset * genetics.graySpeed * 1.4));
    }

    // Extra extreme-longevity white conversion (75+ -> 95+ -> 105+)
    const whiteDominance = smoothstep(genetics.whiteConversionStartYears, genetics.whiteConversionStartYears + 24, ageYears) * grayFactor;
    const eyebrowGrayFactor = clamp01(grayFactor * 0.78 + whiteDominance * 0.2);
    const beardYearsDelta = Math.max(0, ageYears - Math.max(24, genetics.grayOnsetYears - genetics.beardEarlyGrayOffsetYears));
    const beardGrayFactor =
      ageYears >= 24
        ? clamp01(Math.min(1, 1 - Math.exp(-beardYearsDelta * genetics.graySpeed * 1.65)) * (0.85 + 0.15 * whiteDominance))
        : 0;

    // 2. Thinning / Rarefaction & Recession
    const thinningCurve = smoothstep(genetics.thinningOnsetYears, 105, ageYears);
    const extremeThinBoost = smoothstep(82, 115, ageYears) * 0.22;
    const thinningFactor = clamp01(thinningCurve * genetics.thinningIntensity * 0.72 + extremeThinBoost);

    const recedingCurve = smoothstep(28, 72, ageYears);
    const recedingLevel = clamp01(recedingCurve * genetics.recedingPredisposition * 0.95);

    const baldCurve = smoothstep(32, 80, ageYears);
    const crownBaldness = clamp01(baldCurve * genetics.baldnessPredisposition);

    // 3. Baby / Infant / Toddler smooth hair evolution vs adult/elderly style evolution
    let babyHairPhase: HairAgingResult['babyHairPhase'] = 'mature';
    let babyHairScale = 1.0;
    let effectiveHairStyle = baseStyle;

    if (safeMonths < 2) {
      babyHairPhase = 'newborn';
      babyHairScale = 0.22 + genetics.infantHairDensity * 0.35;
      effectiveHairStyle =
        baseStyle.category === 'careca' || genetics.infantHairDensity < 0.34
          ? findHairStyle('careca')
          : findHairStyle('fio_bebe');
    } else if (safeMonths < 12) {
      babyHairPhase = 'infant';
      const t = smoothstep(2, 12, safeMonths);
      babyHairScale = 0.38 + genetics.infantHairDensity * 0.42 + t * 0.18;
      if (baseStyle.category === 'careca') {
        effectiveHairStyle = findHairStyle('careca');
      } else if (safeMonths < 7 && genetics.infantHairDensity < 0.45) {
        effectiveHairStyle = findHairStyle('fio_bebe');
      } else {
        effectiveHairStyle = findHairStyle('fio_bebe');
      }
    } else if (safeMonths < 36) {
      babyHairPhase = 'toddler';
      const t = smoothstep(12, 36, safeMonths);
      babyHairScale = 0.72 + t * 0.28;
      if (baseStyle.category === 'careca') {
        effectiveHairStyle = findHairStyle('careca');
      } else if (safeMonths < 20 && baseStyle.category === 'longo') {
        effectiveHairStyle = findHairStyle('cacheado_curto');
      } else if (safeMonths < 18) {
        effectiveHairStyle = findHairStyle('fio_bebe');
      } else {
        effectiveHairStyle = baseStyle;
      }
    } else {
      // Mature age: if genetically predisposed male with receding/baldness, smoothly evolve hair silhouette
      if (baseStyle.category !== 'careca' && baseStyle.category !== 'entradas') {
        if (gender === 'Masculino' && crownBaldness > 0.84 && ageYears >= 60) {
          effectiveHairStyle = findHairStyle('coroa_calva');
        } else if (gender === 'Masculino' && recedingLevel > 0.68 && ageYears >= 46) {
          effectiveHairStyle = findHairStyle('entradas_acentuadas');
        } else if (gender === 'Masculino' && recedingLevel > 0.42 && ageYears >= 36 && (baseStyle.category === 'curto' || baseStyle.category === 'medio')) {
          effectiveHairStyle = findHairStyle('entradas_leves');
        }
      }
    }

    // 4. Resolve Colors (keep original color if user explicitly picked fashion or already white, otherwise apply progressive graying)
    const isAlreadyWhite = baseColor.id === 'branco' || baseColor.id === 'prateado';
    const effectiveGray = isAlreadyWhite ? Math.max(0.5, grayFactor) : grayFactor;

    const resolvedHairHex = this.applyGrayAndWhiteToHex(baseColor.base, effectiveGray, whiteDominance);
    const resolvedHairHighlightHex = this.applyGrayAndWhiteToHex(baseColor.highlight, effectiveGray, whiteDominance);
    const resolvedHairShadowHex = this.applyGrayAndWhiteToHex(baseColor.shadow, effectiveGray * 0.92, whiteDominance * 0.85);
    const resolvedEyebrowHex = this.applyGrayAndWhiteToHex(baseColor.shadow, eyebrowGrayFactor, whiteDominance * 0.75);
    const resolvedBeardHex = this.applyGrayAndWhiteToHex(baseColor.base, beardGrayFactor, whiteDominance * 0.8);

    return {
      genetics,
      grayFactor,
      whiteDominance,
      eyebrowGrayFactor,
      beardGrayFactor,
      thinningFactor,
      recedingLevel,
      crownBaldness,
      babyHairPhase,
      babyHairScale,
      effectiveHairStyle,
      resolvedHairHex,
      resolvedHairHighlightHex,
      resolvedHairShadowHex,
      resolvedEyebrowHex,
      resolvedBeardHex,
    };
  }
}
