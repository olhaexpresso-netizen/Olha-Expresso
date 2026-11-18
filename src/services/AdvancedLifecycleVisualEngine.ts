import { AgeStage2D, CharacterAppearance } from '../types';
import { createSeededRng } from './CharacterAppearanceGenerator';
import { HairAgingEngine, HairAgingResult } from './HairAgingEngine';

export interface AgeStageDef {
  id: AgeStage2D;
  label: string;
  shortLabel: string;
  minMonths: number;
  maxMonths: number; // inclusive upper bound for display; resolution uses sequential thresholds
  ageRangeText: string;
}

export const AGE_STAGE_DEFS: AgeStageDef[] = [
  { id: 'RECEM_NASCIDO', label: 'Recém-nascido', shortLabel: 'Recém-nasc.', minMonths: 0, maxMonths: 1, ageRangeText: '0–1 mês' },
  { id: 'BEBE_PEQUENO', label: 'Bebê pequeno', shortLabel: 'Bebê peq.', minMonths: 2, maxMonths: 5, ageRangeText: '2–5 meses' },
  { id: 'BEBE', label: 'Bebê', shortLabel: 'Bebê', minMonths: 6, maxMonths: 11, ageRangeText: '6–11 meses' },
  { id: 'PRIMEIRA_INFANCIA', label: 'Primeira infância', shortLabel: '1ª infância', minMonths: 12, maxMonths: 35, ageRangeText: '1–2 anos' },
  { id: 'CRIANCA_PEQUENA', label: 'Criança pequena', shortLabel: 'Criança peq.', minMonths: 36, maxMonths: 71, ageRangeText: '3–5 anos' },
  { id: 'CRIANCA', label: 'Criança', shortLabel: 'Criança', minMonths: 72, maxMonths: 119, ageRangeText: '6–9 anos' },
  { id: 'PRE_ADOLESCENTE', label: 'Pré-adolescente', shortLabel: 'Pré-adol.', minMonths: 120, maxMonths: 155, ageRangeText: '10–12 anos' },
  { id: 'ADOLESCENTE_INICIAL', label: 'Adolescente inicial', shortLabel: 'Adol. ini.', minMonths: 156, maxMonths: 191, ageRangeText: '13–15 anos' },
  { id: 'ADOLESCENTE_FINAL', label: 'Adolescente final', shortLabel: 'Adol. fin.', minMonths: 192, maxMonths: 215, ageRangeText: '16–17 anos' },
  { id: 'ADULTO_JOVEM', label: 'Adulto jovem', shortLabel: 'Jovem', minMonths: 216, maxMonths: 299, ageRangeText: '18–24 anos' },
  { id: 'ADULTO', label: 'Adulto', shortLabel: 'Adulto', minMonths: 300, maxMonths: 419, ageRangeText: '25–34 anos' },
  { id: 'ADULTO_MADURO', label: 'Adulto maduro', shortLabel: 'Maduro', minMonths: 420, maxMonths: 539, ageRangeText: '35–44 anos' },
  { id: 'MEIA_IDADE_INICIAL', label: 'Meia-idade inicial', shortLabel: 'Meia-id. ini.', minMonths: 540, maxMonths: 659, ageRangeText: '45–54 anos' },
  { id: 'MEIA_IDADE_AVANCADA', label: 'Meia-idade avançada', shortLabel: 'Meia-id. av.', minMonths: 660, maxMonths: 779, ageRangeText: '55–64 anos' },
  { id: 'IDOSO_INICIAL', label: 'Idoso inicial', shortLabel: 'Idoso ini.', minMonths: 780, maxMonths: 899, ageRangeText: '65–74 anos' },
  { id: 'IDOSO', label: 'Idoso', shortLabel: 'Idoso', minMonths: 900, maxMonths: 1019, ageRangeText: '75–84 anos' },
  { id: 'IDOSO_AVANCADO', label: 'Idoso avançado', shortLabel: 'Idoso av.', minMonths: 1020, maxMonths: 1139, ageRangeText: '85–94 anos' },
  { id: 'LONGEVIDADE_EXTREMA', label: 'Longevidade extrema', shortLabel: 'Long. extr.', minMonths: 1140, maxMonths: 1259, ageRangeText: '95–104 anos' },
  { id: 'CENTENARIO', label: 'Centenário', shortLabel: 'Centenário', minMonths: 1260, maxMonths: 1440, ageRangeText: '105+ anos' },
];

export interface FacialProportions {
  headScaleX: number;
  headScaleY: number;
  skullRoundness: number; // 1.0 newborn plump -> 0.0 adult -> -0.18 elderly gaunt/angular
  cheekVolume: number; // 1.0 baby full cheeks -> 0.0 adult -> -0.55 elderly hollowing
  foreheadHeightOffset: number; // +9.5 newborn low features -> 0.0 adult -> +1.5 elderly
  eyeOffsetY: number; // vertical shift of facial center
  eyeDistanceScale: number; // 1.07 baby -> 1.0 adult -> 0.97 elderly
  eyeScale: number; // 1.25 newborn -> 1.0 adult -> 0.85 centenarian
  noseLengthScale: number; // 0.64 newborn -> 1.0 adult -> 1.13 centenarian
  noseWidthScale: number; // 0.78 newborn -> 1.0 adult -> 1.10 centenarian
  jawWidthScale: number; // 0.84 newborn delicate jaw -> 1.0 adult -> 0.94 aged
  chinSizeScale: number; // 0.74 newborn delicate chin -> 1.0 adult -> 1.05 aged
  lipVolumeScale: number; // 0.84 newborn -> 1.04 young adult -> 0.70 centenarian
  earScale: number; // 0.84 newborn -> 1.0 adult -> 1.16 centenarian
  neckWidthScale: number; // 0.74 newborn -> 1.0 adult -> 0.88 centenarian
  showNeck: boolean;
}

export type SkinAgingClass =
  | 'recem_nascido'
  | 'infantil'
  | 'adolescente'
  | 'adulto_jovem'
  | 'adulto_maduro'
  | 'meia_idade'
  | 'idoso'
  | 'longevidade_extrema';

export interface SkinAgingProfile {
  skinClass: SkinAgingClass;
  wrinkleOpacity: number; // 0..0.92
  deepWrinkles: boolean;
  foreheadLinesOpacity: number;
  crowsFeetOpacity: number;
  nasolabialOpacity: number;
  marionetteLinesOpacity: number;
  underEyeHollowOpacity: number;
  cheekSagOpacity: number;
  ageSpotsOpacity: number;
  teenAcneOpacity: number;
  babyBlushOpacity: number;
  skinDesaturation: number; // 0..0.28 for extreme old age texture/contrast
  lipDesaturation: number; // 0..0.35
}

export interface FacialAgeModifiers {
  ageMonths: number;
  ageYears: number;
  stage: AgeStage2D;
  stageDef: AgeStageDef;
  stageProgress: number; // 0..1
  proportions: FacialProportions;
  skin: SkinAgingProfile;
  hair: HairAgingResult;
  allowFacialHair: boolean;
  facialHairDensity: number; // 0..1 smooth growth from 16y..22y
  allowGlasses: boolean;
  allowEarrings: boolean;
}

export interface AgeTransitionDelta {
  previousStage: AgeStage2D;
  currentStage: AgeStage2D;
  stageChanged: boolean;
  monthsDelta: number;
  proportionDeltaNorm: number;
}

interface ProportionAnchor {
  m: number; // age in months
  headScaleX: number;
  headScaleY: number;
  skullRoundness: number;
  cheekVolume: number;
  foreheadHeightOffset: number;
  eyeOffsetY: number;
  eyeDistanceScale: number;
  eyeScale: number;
  noseLengthScale: number;
  noseWidthScale: number;
  jawWidthScale: number;
  chinSizeScale: number;
  lipVolumeScale: number;
  earScale: number;
  neckWidthScale: number;
}

// Smooth human anatomical curve across 0m (Newborn) to 1440m (120 years)
const ANATOMICAL_ANCHORS: ProportionAnchor[] = [
  { m: 0,    headScaleX: 1.09, headScaleY: 0.87, skullRoundness: 1.00, cheekVolume: 1.00, foreheadHeightOffset: 9.8, eyeOffsetY: 9.8, eyeDistanceScale: 1.07, eyeScale: 1.24, noseLengthScale: 0.64, noseWidthScale: 0.78, jawWidthScale: 0.84, chinSizeScale: 0.72, lipVolumeScale: 0.84, earScale: 0.84, neckWidthScale: 0.72 },
  { m: 2,    headScaleX: 1.08, headScaleY: 0.89, skullRoundness: 0.94, cheekVolume: 0.96, foreheadHeightOffset: 9.0, eyeOffsetY: 9.0, eyeDistanceScale: 1.06, eyeScale: 1.22, noseLengthScale: 0.67, noseWidthScale: 0.80, jawWidthScale: 0.85, chinSizeScale: 0.74, lipVolumeScale: 0.86, earScale: 0.85, neckWidthScale: 0.74 },
  { m: 6,    headScaleX: 1.07, headScaleY: 0.90, skullRoundness: 0.86, cheekVolume: 0.92, foreheadHeightOffset: 8.2, eyeOffsetY: 8.2, eyeDistanceScale: 1.05, eyeScale: 1.20, noseLengthScale: 0.70, noseWidthScale: 0.82, jawWidthScale: 0.86, chinSizeScale: 0.76, lipVolumeScale: 0.88, earScale: 0.87, neckWidthScale: 0.76 },
  { m: 12,   headScaleX: 1.05, headScaleY: 0.92, skullRoundness: 0.76, cheekVolume: 0.82, foreheadHeightOffset: 7.2, eyeOffsetY: 7.2, eyeDistanceScale: 1.04, eyeScale: 1.17, noseLengthScale: 0.73, noseWidthScale: 0.84, jawWidthScale: 0.88, chinSizeScale: 0.79, lipVolumeScale: 0.90, earScale: 0.89, neckWidthScale: 0.79 },
  { m: 24,   headScaleX: 1.04, headScaleY: 0.93, skullRoundness: 0.65, cheekVolume: 0.68, foreheadHeightOffset: 6.0, eyeOffsetY: 6.0, eyeDistanceScale: 1.03, eyeScale: 1.14, noseLengthScale: 0.77, noseWidthScale: 0.87, jawWidthScale: 0.90, chinSizeScale: 0.83, lipVolumeScale: 0.92, earScale: 0.91, neckWidthScale: 0.82 },
  { m: 48,   headScaleX: 1.02, headScaleY: 0.95, skullRoundness: 0.48, cheekVolume: 0.45, foreheadHeightOffset: 4.5, eyeOffsetY: 4.5, eyeDistanceScale: 1.02, eyeScale: 1.10, noseLengthScale: 0.82, noseWidthScale: 0.90, jawWidthScale: 0.92, chinSizeScale: 0.87, lipVolumeScale: 0.94, earScale: 0.93, neckWidthScale: 0.85 },
  { m: 84,   headScaleX: 1.00, headScaleY: 0.96, skullRoundness: 0.30, cheekVolume: 0.28, foreheadHeightOffset: 3.2, eyeOffsetY: 3.2, eyeDistanceScale: 1.01, eyeScale: 1.06, noseLengthScale: 0.87, noseWidthScale: 0.93, jawWidthScale: 0.94, chinSizeScale: 0.91, lipVolumeScale: 0.96, earScale: 0.95, neckWidthScale: 0.88 },
  { m: 120,  headScaleX: 0.99, headScaleY: 0.98, skullRoundness: 0.16, cheekVolume: 0.15, foreheadHeightOffset: 2.0, eyeOffsetY: 2.0, eyeDistanceScale: 1.01, eyeScale: 1.04, noseLengthScale: 0.92, noseWidthScale: 0.96, jawWidthScale: 0.96, chinSizeScale: 0.94, lipVolumeScale: 0.98, earScale: 0.97, neckWidthScale: 0.92 },
  { m: 156,  headScaleX: 0.99, headScaleY: 0.99, skullRoundness: 0.08, cheekVolume: 0.08, foreheadHeightOffset: 1.0, eyeOffsetY: 1.0, eyeDistanceScale: 1.00, eyeScale: 1.02, noseLengthScale: 0.96, noseWidthScale: 0.98, jawWidthScale: 0.98, chinSizeScale: 0.97, lipVolumeScale: 1.00, earScale: 0.99, neckWidthScale: 0.96 },
  { m: 204,  headScaleX: 1.00, headScaleY: 1.00, skullRoundness: 0.02, cheekVolume: 0.02, foreheadHeightOffset: 0.2, eyeOffsetY: 0.2, eyeDistanceScale: 1.00, eyeScale: 1.01, noseLengthScale: 0.99, noseWidthScale: 0.99, jawWidthScale: 0.99, chinSizeScale: 0.99, lipVolumeScale: 1.02, earScale: 1.00, neckWidthScale: 0.99 },
  { m: 264,  headScaleX: 1.00, headScaleY: 1.00, skullRoundness: 0.00, cheekVolume: 0.00, foreheadHeightOffset: 0.0, eyeOffsetY: 0.0, eyeDistanceScale: 1.00, eyeScale: 1.00, noseLengthScale: 1.00, noseWidthScale: 1.00, jawWidthScale: 1.00, chinSizeScale: 1.00, lipVolumeScale: 1.03, earScale: 1.00, neckWidthScale: 1.00 },
  { m: 360,  headScaleX: 1.005, headScaleY: 1.00, skullRoundness: 0.00, cheekVolume: 0.00, foreheadHeightOffset: 0.0, eyeOffsetY: 0.0, eyeDistanceScale: 1.00, eyeScale: 0.99, noseLengthScale: 1.01, noseWidthScale: 1.01, jawWidthScale: 1.01, chinSizeScale: 1.00, lipVolumeScale: 1.00, earScale: 1.01, neckWidthScale: 1.01 },
  { m: 480,  headScaleX: 1.01, headScaleY: 0.995, skullRoundness: -0.02, cheekVolume: -0.05, foreheadHeightOffset: 0.2, eyeOffsetY: 0.2, eyeDistanceScale: 1.00, eyeScale: 0.97, noseLengthScale: 1.02, noseWidthScale: 1.02, jawWidthScale: 1.01, chinSizeScale: 1.01, lipVolumeScale: 0.96, earScale: 1.02, neckWidthScale: 1.01 },
  { m: 600,  headScaleX: 1.015, headScaleY: 0.99, skullRoundness: -0.05, cheekVolume: -0.14, foreheadHeightOffset: 0.4, eyeOffsetY: 0.4, eyeDistanceScale: 0.995, eyeScale: 0.95, noseLengthScale: 1.04, noseWidthScale: 1.03, jawWidthScale: 1.00, chinSizeScale: 1.02, lipVolumeScale: 0.91, earScale: 1.04, neckWidthScale: 1.00 },
  { m: 720,  headScaleX: 1.01, headScaleY: 0.985, skullRoundness: -0.08, cheekVolume: -0.24, foreheadHeightOffset: 0.7, eyeOffsetY: 0.7, eyeDistanceScale: 0.99, eyeScale: 0.92, noseLengthScale: 1.06, noseWidthScale: 1.05, jawWidthScale: 0.98, chinSizeScale: 1.03, lipVolumeScale: 0.85, earScale: 1.06, neckWidthScale: 0.97 },
  { m: 840,  headScaleX: 1.00, headScaleY: 0.98, skullRoundness: -0.12, cheekVolume: -0.34, foreheadHeightOffset: 1.0, eyeOffsetY: 1.0, eyeDistanceScale: 0.985, eyeScale: 0.90, noseLengthScale: 1.08, noseWidthScale: 1.06, jawWidthScale: 0.96, chinSizeScale: 1.03, lipVolumeScale: 0.80, earScale: 1.09, neckWidthScale: 0.94 },
  { m: 960,  headScaleX: 0.99, headScaleY: 0.975, skullRoundness: -0.15, cheekVolume: -0.44, foreheadHeightOffset: 1.2, eyeOffsetY: 1.2, eyeDistanceScale: 0.98, eyeScale: 0.88, noseLengthScale: 1.10, noseWidthScale: 1.08, jawWidthScale: 0.94, chinSizeScale: 1.04, lipVolumeScale: 0.76, earScale: 1.12, neckWidthScale: 0.91 },
  { m: 1080, headScaleX: 0.985, headScaleY: 0.97, skullRoundness: -0.18, cheekVolume: -0.52, foreheadHeightOffset: 1.4, eyeOffsetY: 1.4, eyeDistanceScale: 0.975, eyeScale: 0.86, noseLengthScale: 1.12, noseWidthScale: 1.09, jawWidthScale: 0.92, chinSizeScale: 1.05, lipVolumeScale: 0.72, earScale: 1.14, neckWidthScale: 0.88 },
  { m: 1200, headScaleX: 0.98, headScaleY: 0.965, skullRoundness: -0.20, cheekVolume: -0.58, foreheadHeightOffset: 1.6, eyeOffsetY: 1.6, eyeDistanceScale: 0.97, eyeScale: 0.84, noseLengthScale: 1.13, noseWidthScale: 1.10, jawWidthScale: 0.90, chinSizeScale: 1.05, lipVolumeScale: 0.69, earScale: 1.16, neckWidthScale: 0.86 },
  { m: 1320, headScaleX: 0.975, headScaleY: 0.96, skullRoundness: -0.22, cheekVolume: -0.64, foreheadHeightOffset: 1.8, eyeOffsetY: 1.8, eyeDistanceScale: 0.965, eyeScale: 0.82, noseLengthScale: 1.14, noseWidthScale: 1.11, jawWidthScale: 0.89, chinSizeScale: 1.06, lipVolumeScale: 0.66, earScale: 1.17, neckWidthScale: 0.84 },
  { m: 1440, headScaleX: 0.97, headScaleY: 0.96, skullRoundness: -0.24, cheekVolume: -0.68, foreheadHeightOffset: 2.0, eyeOffsetY: 2.0, eyeDistanceScale: 0.96, eyeScale: 0.81, noseLengthScale: 1.15, noseWidthScale: 1.12, jawWidthScale: 0.88, chinSizeScale: 1.06, lipVolumeScale: 0.64, earScale: 1.18, neckWidthScale: 0.82 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export class AdvancedLifecycleVisualEngine {
  static resolveAgeStage(ageMonths: number): AgeStage2D {
    const m = Math.max(0, ageMonths);
    if (m < 2) return 'RECEM_NASCIDO';
    if (m < 6) return 'BEBE_PEQUENO';
    if (m < 12) return 'BEBE';
    if (m < 36) return 'PRIMEIRA_INFANCIA';
    if (m < 72) return 'CRIANCA_PEQUENA';
    if (m < 120) return 'CRIANCA';
    if (m < 156) return 'PRE_ADOLESCENTE';
    if (m < 192) return 'ADOLESCENTE_INICIAL';
    if (m < 216) return 'ADOLESCENTE_FINAL';
    if (m < 300) return 'ADULTO_JOVEM';
    if (m < 420) return 'ADULTO';
    if (m < 540) return 'ADULTO_MADURO';
    if (m < 660) return 'MEIA_IDADE_INICIAL';
    if (m < 780) return 'MEIA_IDADE_AVANCADA';
    if (m < 900) return 'IDOSO_INICIAL';
    if (m < 1020) return 'IDOSO';
    if (m < 1140) return 'IDOSO_AVANCADO';
    if (m < 1260) return 'LONGEVIDADE_EXTREMA';
    return 'CENTENARIO';
  }

  static getStageDef(stage: AgeStage2D): AgeStageDef {
    return AGE_STAGE_DEFS.find(s => s.id === stage) || AGE_STAGE_DEFS[10];
  }

  static getStageLabel(stage: AgeStage2D): string {
    return this.getStageDef(stage).label;
  }

  static formatAgeDisplay(ageMonths: number): string {
    const m = Math.max(0, Math.round(ageMonths));
    if (m < 12) {
      return `${m} ${m === 1 ? 'mês' : 'meses'}`;
    }
    const years = Math.floor(m / 12);
    const remMonths = m % 12;
    if (remMonths > 0 && years < 3) {
      return `${years}a ${remMonths}m`;
    }
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }

  static calculateAgeProgress(ageMonths: number): number {
    const m = Math.max(0, Math.min(1440, ageMonths));
    const stage = this.resolveAgeStage(m);
    const def = this.getStageDef(stage);
    const span = Math.max(1, def.maxMonths + 1 - def.minMonths);
    return clamp01((m - def.minMonths) / span);
  }

  static calculateFacialProportions(ageMonths: number, appearanceSeed = 'default'): FacialProportions {
    const m = Math.max(0, Math.min(1440, ageMonths));
    const rng = createSeededRng(`${appearanceSeed}_prop_v9`);
    // Subtle deterministic individual variance (~2%) preserved across entire life
    const headVarX = 0.985 + rng() * 0.03;
    const headVarY = 0.985 + rng() * 0.03;
    const eyeSizeVar = 0.97 + rng() * 0.06;

    let a = ANATOMICAL_ANCHORS[0];
    let b = ANATOMICAL_ANCHORS[ANATOMICAL_ANCHORS.length - 1];
    for (let i = 0; i < ANATOMICAL_ANCHORS.length - 1; i++) {
      if (m >= ANATOMICAL_ANCHORS[i].m && m <= ANATOMICAL_ANCHORS[i + 1].m) {
        a = ANATOMICAL_ANCHORS[i];
        b = ANATOMICAL_ANCHORS[i + 1];
        break;
      }
    }

    const span = Math.max(1, b.m - a.m);
    const rawT = clamp01((m - a.m) / span);
    // Smooth cubic ease inside segment for continuity without sharp corners
    const t = rawT * rawT * (3 - 2 * rawT);

    return {
      headScaleX: lerp(a.headScaleX, b.headScaleX, t) * headVarX,
      headScaleY: lerp(a.headScaleY, b.headScaleY, t) * headVarY,
      skullRoundness: lerp(a.skullRoundness, b.skullRoundness, t),
      cheekVolume: lerp(a.cheekVolume, b.cheekVolume, t),
      foreheadHeightOffset: lerp(a.foreheadHeightOffset, b.foreheadHeightOffset, t),
      eyeOffsetY: lerp(a.eyeOffsetY, b.eyeOffsetY, t),
      eyeDistanceScale: lerp(a.eyeDistanceScale, b.eyeDistanceScale, t),
      eyeScale: lerp(a.eyeScale, b.eyeScale, t) * eyeSizeVar,
      noseLengthScale: lerp(a.noseLengthScale, b.noseLengthScale, t),
      noseWidthScale: lerp(a.noseWidthScale, b.noseWidthScale, t),
      jawWidthScale: lerp(a.jawWidthScale, b.jawWidthScale, t),
      chinSizeScale: lerp(a.chinSizeScale, b.chinSizeScale, t),
      lipVolumeScale: lerp(a.lipVolumeScale, b.lipVolumeScale, t),
      earScale: lerp(a.earScale, b.earScale, t),
      neckWidthScale: lerp(a.neckWidthScale, b.neckWidthScale, t),
      showNeck: m >= 12,
    };
  }

  static calculateSkinAging(ageMonths: number, appearanceSeed = 'default'): SkinAgingProfile {
    const m = Math.max(0, Math.min(1440, ageMonths));
    const ageYears = m / 12;
    const rng = createSeededRng(`${appearanceSeed}_skin_v9`);

    const wrinkleGenetics = 0.72 + rng() * 0.52; // individual aging rate
    const spotPredisposition = 0.25 + rng() * 0.75;
    const acnePredisposition = rng() < 0.36 ? 0.4 + rng() * 0.5 : 0;

    let skinClass: SkinAgingClass = 'adulto_jovem';
    if (m < 12) skinClass = 'recem_nascido';
    else if (ageYears < 13) skinClass = 'infantil';
    else if (ageYears < 18) skinClass = 'adolescente';
    else if (ageYears < 35) skinClass = 'adulto_jovem';
    else if (ageYears < 50) skinClass = 'adulto_maduro';
    else if (ageYears < 65) skinClass = 'meia_idade';
    else if (ageYears < 90) skinClass = 'idoso';
    else skinClass = 'longevidade_extrema';

    // Zero adult wrinkles before age 30
    const baseWrinkle = smoothstep(32, 92, ageYears) * 0.85 * wrinkleGenetics;
    const extraDeep = smoothstep(75, 110, ageYears) * 0.25;
    const wrinkleOpacity = ageYears < 30 ? 0 : clamp01(baseWrinkle + extraDeep);

    const foreheadLinesOpacity = ageYears < 32 ? 0 : clamp01(smoothstep(32, 78, ageYears) * 0.82 * wrinkleGenetics);
    const crowsFeetOpacity = ageYears < 30 ? 0 : clamp01(smoothstep(30, 74, ageYears) * 0.88 * wrinkleGenetics);
    const nasolabialOpacity = ageYears < 35 ? 0 : clamp01(smoothstep(35, 86, ageYears) * 0.90 * wrinkleGenetics);
    const marionetteLinesOpacity = ageYears < 54 ? 0 : clamp01(smoothstep(54, 96, ageYears) * 0.85 * wrinkleGenetics);
    const underEyeHollowOpacity = ageYears < 48 ? 0 : clamp01(smoothstep(48, 98, ageYears) * 0.80);
    const cheekSagOpacity = ageYears < 64 ? 0 : clamp01(smoothstep(64, 108, ageYears) * 0.75);

    const ageSpotsOpacity = ageYears < 62 ? 0 : clamp01(smoothstep(62, 102, ageYears) * 0.72 * spotPredisposition);

    // Subtle teen acne window (peaks 14..16, disappears completely by 19)
    const teenAcneUp = smoothstep(12.2, 14.5, ageYears);
    const teenAcneDown = 1 - smoothstep(16.5, 19.0, ageYears);
    const teenAcneOpacity = clamp01(teenAcneUp * teenAcneDown * acnePredisposition * 0.65);

    const babyBlushOpacity = clamp01(1 - smoothstep(1.5, 9, ageYears)) * 0.22;
    const skinDesaturation = smoothstep(78, 116, ageYears) * 0.24;
    const lipDesaturation = smoothstep(70, 114, ageYears) * 0.34;

    return {
      skinClass,
      wrinkleOpacity,
      deepWrinkles: ageYears >= 65,
      foreheadLinesOpacity,
      crowsFeetOpacity,
      nasolabialOpacity,
      marionetteLinesOpacity,
      underEyeHollowOpacity,
      cheekSagOpacity,
      ageSpotsOpacity,
      teenAcneOpacity,
      babyBlushOpacity,
      skinDesaturation,
      lipDesaturation,
    };
  }

  static calculateFacialAgeModifiers(
    ageMonths: number,
    appearance: CharacterAppearance,
    gender: 'Masculino' | 'Feminino' | 'Outro' = 'Masculino'
  ): FacialAgeModifiers {
    const safeMonths = Math.max(0, Math.min(1440, ageMonths));
    const ageYears = safeMonths / 12;
    const stage = this.resolveAgeStage(safeMonths);
    const stageDef = this.getStageDef(stage);
    const stageProgress = this.calculateAgeProgress(safeMonths);
    const seed = appearance.appearanceSeed || appearance.characterId || 'default';

    const proportions = this.calculateFacialProportions(safeMonths, seed);
    const skin = this.calculateSkinAging(safeMonths, seed);
    const hair = HairAgingEngine.calculateHairAging(safeMonths, appearance, gender);

    const allowFacialHair = ageYears >= 16;
    const facialHairDensity = ageYears < 16 ? 0 : clamp01(smoothstep(15.5, 22.0, ageYears));
    const allowGlasses = safeMonths >= 36; // kids 3+ can wear glasses; newborns/babies don't
    const allowEarrings = safeMonths >= 24;

    return {
      ageMonths: safeMonths,
      ageYears,
      stage,
      stageDef,
      stageProgress,
      proportions,
      skin,
      hair,
      allowFacialHair,
      facialHairDensity,
      allowGlasses,
      allowEarrings,
    };
  }

  static calculateAgeTransition(
    previousAgeMonths: number,
    currentAgeMonths: number,
    appearanceSeed = 'default'
  ): AgeTransitionDelta {
    const prevStage = this.resolveAgeStage(previousAgeMonths);
    const currStage = this.resolveAgeStage(currentAgeMonths);
    const p1 = this.calculateFacialProportions(previousAgeMonths, appearanceSeed);
    const p2 = this.calculateFacialProportions(currentAgeMonths, appearanceSeed);

    const diffs = [
      p2.headScaleX - p1.headScaleX,
      p2.headScaleY - p1.headScaleY,
      p2.eyeScale - p1.eyeScale,
      p2.noseLengthScale - p1.noseLengthScale,
      p2.jawWidthScale - p1.jawWidthScale,
      p2.cheekVolume - p1.cheekVolume,
      (p2.eyeOffsetY - p1.eyeOffsetY) / 10,
    ];
    const proportionDeltaNorm = Math.sqrt(diffs.reduce((acc, d) => acc + d * d, 0));

    return {
      previousStage: prevStage,
      currentStage: currStage,
      stageChanged: prevStage !== currStage,
      monthsDelta: currentAgeMonths - previousAgeMonths,
      proportionDeltaNorm,
    };
  }

  static preserveCharacterIdentity(characterId: string, appearance: CharacterAppearance): CharacterAppearance {
    return {
      ...appearance,
      characterId: characterId || appearance.characterId,
      appearanceSeed: appearance.appearanceSeed || characterId,
      visualVersion: 9,
    };
  }
}
