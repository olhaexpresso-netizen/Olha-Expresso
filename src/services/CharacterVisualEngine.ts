import { AgeStage2D, Character, CharacterAppearance, FacialExpression, FamilyMember } from '../types';
import {
  AdvancedLifecycleVisualEngine,
  FacialAgeModifiers,
} from './AdvancedLifecycleVisualEngine';
import { AgingProfile2D, CharacterAging2D } from './CharacterAging2D';
import { CharacterAppearanceGenerator } from './CharacterAppearanceGenerator';
import { ExpressionModifiers, CharacterExpressionEngine } from './CharacterExpressionEngine';
import {
  BACKDROP_COLORS,
  EARRING_STYLES,
  EYEBROW_STYLES,
  EYE_COLORS,
  EYE_STYLES,
  EarringDef,
  EyeColorDef,
  EyeStyleDef,
  EyebrowStyleDef,
  FACE_SHAPES,
  FACIAL_HAIR_STYLES,
  FACIAL_MARK_STYLES,
  FaceShapeDef,
  FacialHairDef,
  FacialMarkDef,
  GLASSES_STYLES,
  GlassesDef,
  MOUTH_STYLES,
  MUSTACHE_STYLES,
  MouthStyleDef,
  MustacheDef,
  NOSE_STYLES,
  NoseStyleDef,
  SHIRT_COLORS,
  SKIN_TONES,
  SkinToneDef,
  findEarrings,
  findEyeColor,
  findEyeStyle,
  findEyebrowStyle,
  findFaceShape,
  findFacialHair,
  findFacialMark,
  findGlasses,
  findMouthStyle,
  findMustache,
  findNoseStyle,
  findSkinTone,
} from './CharacterFaceLibrary';
import { HAIR_COLORS, HAIR_STYLES, HairColorDef, HairStyleDef, findHairColor, findHairStyle } from './CharacterHairLibrary';
import { VISUAL_ENGINE_VERSION, visualModelCache } from './CharacterVisualCache';

export type AgeStage = AgeStage2D;

export interface CharacterVisualIdentity {
  characterId: string;
  appearanceSeed: string;
  imageAssetId: string | null;
  referencePortraitId: string | null;
  faceShape: string;
  skinTone: string;
  eyeShape: string;
  eyeColor: string;
  noseShape: string;
  lipShape: string;
  hairColor: string;
  hairTexture: string;
  hairStyle: string;
  facialFeatures: string[];
  ageMonths: number;
  ageStage: AgeStage;
  visualVersion: number;
  portraitHistory: string[];
}

export type LayerName =
  | 'baseHead'
  | 'ears'
  | 'backHair'
  | 'eyebrows'
  | 'eyes'
  | 'nose'
  | 'mouth'
  | 'facialHair'
  | 'frontHair'
  | 'accessories';

export interface LayeredVisualModel {
  visualVersion: number;
  ageMonths: number;
  appearance: CharacterAppearance;
  aging: AgingProfile2D;
  lifecycle: FacialAgeModifiers;
  expression: ExpressionModifiers;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  faceShape: FaceShapeDef;
  skinTone: SkinToneDef;
  eyeStyle: EyeStyleDef;
  eyeColor: EyeColorDef;
  eyebrowStyle: EyebrowStyleDef;
  noseStyle: NoseStyleDef;
  mouthStyle: MouthStyleDef;
  hairStyle: HairStyleDef;
  hairColor: HairColorDef;
  resolvedHairHex: string;
  resolvedHairHighlightHex: string;
  resolvedHairShadowHex: string;
  resolvedEyebrowHex: string;
  resolvedBeardHex: string;
  facialHair: FacialHairDef;
  mustache: MustacheDef;
  glasses: GlassesDef;
  earrings: EarringDef;
  facialMark: FacialMarkDef;
  shirtColor: string;
  backgroundColor: string;
  layersOrder: LayerName[];
}

export class CharacterVisualEngine {
  static readonly VISUAL_VERSION = VISUAL_ENGINE_VERSION;

  static readonly LAYER_SEQUENCE: LayerName[] = [
    'baseHead',
    'ears',
    'backHair',
    'eyebrows',
    'eyes',
    'nose',
    'mouth',
    'facialHair',
    'frontHair',
    'accessories',
  ];

  static resolveAgeStage(ageMonths: number): AgeStage2D {
    return AdvancedLifecycleVisualEngine.resolveAgeStage(ageMonths);
  }

  static getAgeStage(ageYears: number): AgeStage2D {
    return AdvancedLifecycleVisualEngine.resolveAgeStage(Math.max(0, ageYears) * 12);
  }

  static generateFromSeed(
    seed: string,
    gender: 'Masculino' | 'Feminino' | 'Outro' = 'Masculino',
    characterId?: string
  ): CharacterAppearance {
    const app = CharacterAppearanceGenerator.generateFromSeed(seed, { gender, characterId });
    return { ...app, visualVersion: VISUAL_ENGINE_VERSION };
  }

  static resolveFromCharacter(character: Character): CharacterAppearance {
    if (character.appearance) {
      return AdvancedLifecycleVisualEngine.preserveCharacterIdentity(character.id, character.appearance);
    }
    const seed = character.appearanceSeed || `${character.id}_${character.avatarSeed || character.firstName}_${character.lastName}_${character.gender}`;
    return AdvancedLifecycleVisualEngine.preserveCharacterIdentity(
      character.id,
      CharacterAppearanceGenerator.generateFromSeed(seed, {
        characterId: character.id,
        gender: character.gender,
        ageYears: character.currentAge,
      })
    );
  }

  static resolveFromFamilyMember(member: FamilyMember, playerCharacter?: Character): CharacterAppearance {
    if (member.appearance) {
      return AdvancedLifecycleVisualEngine.preserveCharacterIdentity(member.id, member.appearance);
    }
    const gender: 'Masculino' | 'Feminino' =
      member.relation === 'Pai' || member.relation === 'Avô' || member.relation === 'Irmão' || member.relation === 'Filho'
        ? 'Masculino'
        : member.relation === 'Cônjuge' && playerCharacter?.gender === 'Feminino'
        ? 'Masculino'
        : 'Feminino';

    const seed = member.appearanceSeed || `${member.characterId}_${member.id}_${member.name}_${member.relation}`;

    if (playerCharacter) {
      const playerApp = this.resolveFromCharacter(playerCharacter);
      if (member.relation === 'Pai' || member.relation === 'Mãe' || member.relation === 'Avô' || member.relation === 'Avó') {
        return AdvancedLifecycleVisualEngine.preserveCharacterIdentity(
          member.id,
          CharacterAppearanceGenerator.deriveParentFromChild(member.id, seed, member.relation, playerApp)
        );
      }
      if (member.relation === 'Irmão' || member.relation === 'Irmã' || member.relation === 'Filho' || member.relation === 'Filha') {
        return AdvancedLifecycleVisualEngine.preserveCharacterIdentity(
          member.id,
          CharacterAppearanceGenerator.inheritFromParents(member.id, seed, gender, playerApp, undefined)
        );
      }
    }

    return AdvancedLifecycleVisualEngine.preserveCharacterIdentity(
      member.id,
      CharacterAppearanceGenerator.generateFromSeed(seed, {
        characterId: member.id,
        gender,
        ageYears: member.age,
      })
    );
  }

  static buildLayeredModelFromMonths(
    appearance: CharacterAppearance,
    ageMonths: number,
    expression: FacialExpression = 'Neutra',
    gender: 'Masculino' | 'Feminino' | 'Outro' = 'Masculino'
  ): LayeredVisualModel {
    const safeMonths = Math.max(0, Math.min(1440, Math.round(ageMonths * 10) / 10));
    const version = VISUAL_ENGINE_VERSION;

    const cacheKey = `${appearance.characterId}|v${version}|${appearance.appearanceSeed}|${appearance.faceShape}|${appearance.skinTone}|${appearance.eyeStyle}|${appearance.eyeColor}|${appearance.eyebrowStyle}|${appearance.noseStyle}|${appearance.mouthStyle}|${appearance.hairStyle}|${appearance.hairColor}|${appearance.facialHair}|${appearance.mustacheStyle || 'none'}|${appearance.accessories.glasses}|${appearance.accessories.earrings}|${appearance.accessories.freckles}|${appearance.accessories.facialMark}|${appearance.shirtColor || ''}|${appearance.backgroundColor || ''}|m${safeMonths}|${expression}|${gender}`;

    const cached = visualModelCache.get(cacheKey) as LayeredVisualModel | undefined;
    if (cached && cached.visualVersion === version) {
      return cached;
    }

    const lifecycle = AdvancedLifecycleVisualEngine.calculateFacialAgeModifiers(safeMonths, appearance, gender);
    const aging = CharacterAging2D.getAgingProfileByMonths(safeMonths, appearance, gender);
    const exprMod = CharacterExpressionEngine.getModifiers(expression, safeMonths);

    // Keep permanent character faceShape identity (morphing smoothly in renderer via proportions)
    const faceShape = findFaceShape(appearance.faceShape);
    const skinTone = findSkinTone(appearance.skinTone);
    const eyeStyle = findEyeStyle(appearance.eyeStyle);
    const eyeColor = findEyeColor(appearance.eyeColor);
    const eyebrowStyle = findEyebrowStyle(appearance.eyebrowStyle);
    const noseStyle = findNoseStyle(appearance.noseStyle);
    const mouthStyle = findMouthStyle(appearance.mouthStyle);

    const hairStyle = lifecycle.hair.effectiveHairStyle || findHairStyle(appearance.hairStyle);
    const hairColor = findHairColor(appearance.hairColor);

    const facialHair = lifecycle.allowFacialHair ? findFacialHair(appearance.facialHair) : findFacialHair('none');
    const mustache = lifecycle.allowFacialHair ? findMustache(appearance.mustacheStyle) : findMustache('none');

    const glasses = lifecycle.allowGlasses ? findGlasses(appearance.accessories.glasses) : findGlasses('none');
    const earrings = lifecycle.allowEarrings ? findEarrings(appearance.accessories.earrings) : findEarrings('none');
    const facialMark = findFacialMark(appearance.accessories.facialMark);

    const model: LayeredVisualModel = {
      visualVersion: version,
      ageMonths: safeMonths,
      appearance: AdvancedLifecycleVisualEngine.preserveCharacterIdentity(appearance.characterId, appearance),
      aging,
      lifecycle,
      expression: exprMod,
      gender,
      faceShape,
      skinTone,
      eyeStyle,
      eyeColor,
      eyebrowStyle,
      noseStyle,
      mouthStyle,
      hairStyle,
      hairColor,
      resolvedHairHex: lifecycle.hair.resolvedHairHex,
      resolvedHairHighlightHex: lifecycle.hair.resolvedHairHighlightHex,
      resolvedHairShadowHex: lifecycle.hair.resolvedHairShadowHex,
      resolvedEyebrowHex: lifecycle.hair.resolvedEyebrowHex,
      resolvedBeardHex: lifecycle.hair.resolvedBeardHex,
      facialHair,
      mustache,
      glasses,
      earrings,
      facialMark,
      shirtColor: appearance.shirtColor || SHIRT_COLORS[0],
      backgroundColor: appearance.backgroundColor || BACKDROP_COLORS[0],
      layersOrder: [...this.LAYER_SEQUENCE],
    };

    visualModelCache.set(cacheKey, model);
    return model;
  }

  static buildLayeredModel(
    appearance: CharacterAppearance,
    ageYears: number,
    expression: FacialExpression = 'Neutra',
    gender: 'Masculino' | 'Feminino' | 'Outro' = 'Masculino'
  ): LayeredVisualModel {
    return this.buildLayeredModelFromMonths(appearance, Math.max(0, ageYears) * 12, expression, gender);
  }

  static getLibrariesSummary() {
    return {
      visualVersion: VISUAL_ENGINE_VERSION,
      ageStages: 19,
      faceShapes: FACE_SHAPES.length,
      skinTones: SKIN_TONES.length,
      eyeStyles: EYE_STYLES.length,
      eyeColors: EYE_COLORS.length,
      eyebrowStyles: EYEBROW_STYLES.length,
      noseStyles: NOSE_STYLES.length,
      mouthStyles: MOUTH_STYLES.length,
      hairStyles: HAIR_STYLES.length,
      hairColors: HAIR_COLORS.length,
      facialHairStyles: FACIAL_HAIR_STYLES.length,
      mustacheStyles: MUSTACHE_STYLES.length,
      glassesStyles: GLASSES_STYLES.length,
      earringStyles: EARRING_STYLES.length,
      facialMarks: FACIAL_MARK_STYLES.length,
    };
  }
}
