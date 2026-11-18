import { AgeStage2D, CharacterAppearance } from '../types';
import {
  AGE_STAGE_DEFS,
  AdvancedLifecycleVisualEngine,
  FacialProportions,
  SkinAgingProfile,
} from './AdvancedLifecycleVisualEngine';
import { HairAgingEngine, HairAgingResult } from './HairAgingEngine';

export interface AgingProfile2D {
  ageYears: number;
  ageMonths: number;
  stage: AgeStage2D;
  label: string;
  stageProgress: number;
  headScaleX: number;
  headScaleY: number;
  featureOffsetY: number;
  eyeScale: number;
  noseScale: number;
  showNeck: boolean;
  wrinkleOpacity: number;
  deepWrinkles: boolean;
  grayFactor: number;
  allowFacialHair: boolean;
  facialHairDensity: number;
  allowGlasses: boolean;
  allowEarrings: boolean;
  recedingHairTendency: number;
  proportions: FacialProportions;
  skin: SkinAgingProfile;
  hair?: HairAgingResult;
}

export class CharacterAging2D {
  static resolveStage(ageYears: number): AgeStage2D {
    return AdvancedLifecycleVisualEngine.resolveAgeStage(Math.max(0, ageYears) * 12);
  }

  static resolveStageFromMonths(ageMonths: number): AgeStage2D {
    return AdvancedLifecycleVisualEngine.resolveAgeStage(ageMonths);
  }

  static getStageLabel(stage: AgeStage2D): string {
    return AdvancedLifecycleVisualEngine.getStageLabel(stage);
  }

  static getAllStages() {
    return AGE_STAGE_DEFS;
  }

  static getAgingProfileByMonths(
    ageMonths: number,
    appearance?: CharacterAppearance,
    gender: 'Masculino' | 'Feminino' | 'Outro' = 'Masculino'
  ): AgingProfile2D {
    const safeMonths = Math.max(0, Math.min(1440, ageMonths));
    const safeYears = safeMonths / 12;

    if (appearance) {
      const mod = AdvancedLifecycleVisualEngine.calculateFacialAgeModifiers(safeMonths, appearance, gender);
      return {
        ageYears: safeYears,
        ageMonths: safeMonths,
        stage: mod.stage,
        label: mod.stageDef.label,
        stageProgress: mod.stageProgress,
        headScaleX: mod.proportions.headScaleX,
        headScaleY: mod.proportions.headScaleY,
        featureOffsetY: mod.proportions.eyeOffsetY,
        eyeScale: mod.proportions.eyeScale,
        noseScale: (mod.proportions.noseLengthScale + mod.proportions.noseWidthScale) / 2,
        showNeck: mod.proportions.showNeck,
        wrinkleOpacity: mod.skin.wrinkleOpacity,
        deepWrinkles: mod.skin.deepWrinkles,
        grayFactor: mod.hair.grayFactor,
        allowFacialHair: mod.allowFacialHair,
        facialHairDensity: mod.facialHairDensity,
        allowGlasses: mod.allowGlasses,
        allowEarrings: mod.allowEarrings,
        recedingHairTendency: mod.hair.recedingLevel,
        proportions: mod.proportions,
        skin: mod.skin,
        hair: mod.hair,
      };
    }

    const stage = AdvancedLifecycleVisualEngine.resolveAgeStage(safeMonths);
    const proportions = AdvancedLifecycleVisualEngine.calculateFacialProportions(safeMonths, 'default');
    const skin = AdvancedLifecycleVisualEngine.calculateSkinAging(safeMonths, 'default');
    const stageProgress = AdvancedLifecycleVisualEngine.calculateAgeProgress(safeMonths);
    const grayFactor = safeYears >= 42 ? Math.min(1, (safeYears - 42) / 38) : 0;

    return {
      ageYears: safeYears,
      ageMonths: safeMonths,
      stage,
      label: AdvancedLifecycleVisualEngine.getStageLabel(stage),
      stageProgress,
      headScaleX: proportions.headScaleX,
      headScaleY: proportions.headScaleY,
      featureOffsetY: proportions.eyeOffsetY,
      eyeScale: proportions.eyeScale,
      noseScale: (proportions.noseLengthScale + proportions.noseWidthScale) / 2,
      showNeck: proportions.showNeck,
      wrinkleOpacity: skin.wrinkleOpacity,
      deepWrinkles: skin.deepWrinkles,
      grayFactor,
      allowFacialHair: safeYears >= 16,
      facialHairDensity: safeYears < 16 ? 0 : Math.min(1, (safeYears - 15.5) / 6.5),
      allowGlasses: safeMonths >= 36,
      allowEarrings: safeMonths >= 24,
      recedingHairTendency: safeYears >= 38 ? Math.min(0.65, (safeYears - 38) / 45) : 0,
      proportions,
      skin,
    };
  }

  static getAgingProfile(ageYears: number): AgingProfile2D {
    return this.getAgingProfileByMonths(Math.max(0, ageYears) * 12);
  }

  /**
   * Blends base hair hex color toward silver/white smoothly according to grayFactor.
   */
  static applyGrayingToHex(hex: string, grayFactor: number, whiteDominance = 0): string {
    return HairAgingEngine.applyGrayAndWhiteToHex(hex, grayFactor, whiteDominance);
  }
}
