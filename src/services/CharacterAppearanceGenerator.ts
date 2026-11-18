import { CharacterAppearance } from '../types';
import {
  BACKDROP_COLORS,
  EARRING_STYLES,
  EYEBROW_STYLES,
  EYE_COLORS,
  EYE_STYLES,
  FACE_SHAPES,
  FACIAL_HAIR_STYLES,
  FACIAL_MARK_STYLES,
  GLASSES_STYLES,
  MOUTH_STYLES,
  MUSTACHE_STYLES,
  NOSE_STYLES,
  SHIRT_COLORS,
  SKIN_TONES,
} from './CharacterFaceLibrary';
import { HAIR_COLORS, HAIR_STYLES, HairStyleDef } from './CharacterHairLibrary';

export interface AppearanceGenerationOptions {
  characterId?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
  ageYears?: number;
}

export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRng(seed: string): () => number {
  let a = hashSeed(seed) || 1337;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function filterHairByGender(gender?: 'Masculino' | 'Feminino' | 'Outro'): HairStyleDef[] {
  const usable = HAIR_STYLES.filter(h => h.id !== 'fio_bebe');
  if (gender === 'Masculino') {
    return usable.filter(h => h.genderHint === 'M' || h.genderHint === 'U');
  }
  if (gender === 'Feminino') {
    return usable.filter(h => h.genderHint === 'F' || h.genderHint === 'U');
  }
  return usable;
}

export class CharacterAppearanceGenerator {
  static generateFromSeed(seed: string, options: AppearanceGenerationOptions = {}): CharacterAppearance {
    const cleanSeed = (seed || 'vidareal_default').trim();
    const rng = createSeededRng(cleanSeed);
    const gender = options.gender || 'Masculino';
    const characterId = options.characterId || `char_${hashSeed(cleanSeed).toString(36)}`;

    const faceShape = pick(FACE_SHAPES, rng).id;
    const skinTone = pick(SKIN_TONES, rng).id;
    const eyeStyle = pick(EYE_STYLES, rng).id;

    // Realistic Brazilian eye color distribution (higher probability of brown/hazel, still rich diversity)
    const eyeRoll = rng();
    let eyeColor = EYE_COLORS[0].id;
    if (eyeRoll < 0.28) eyeColor = 'castanho_escuro';
    else if (eyeRoll < 0.50) eyeColor = 'castanho_medio';
    else if (eyeRoll < 0.62) eyeColor = 'mel';
    else if (eyeRoll < 0.72) eyeColor = 'avela';
    else if (eyeRoll < 0.81) eyeColor = 'verde_esmeralda';
    else if (eyeRoll < 0.88) eyeColor = 'azul_profundo';
    else if (eyeRoll < 0.93) eyeColor = 'azul_claro';
    else if (eyeRoll < 0.97) eyeColor = 'verde_claro';
    else eyeColor = pick(EYE_COLORS, rng).id;

    const eyebrowStyle = pick(EYEBROW_STYLES, rng).id;
    const noseStyle = pick(NOSE_STYLES, rng).id;
    const mouthStyle = pick(MOUTH_STYLES, rng).id;

    const hairPool = filterHairByGender(gender);
    const hairStyle = pick(hairPool, rng).id;

    // Natural hair colors weighted realistically (skip fashion colors in random gen most of the time)
    const naturalColors = HAIR_COLORS.filter(
      c => c.id !== 'azul_fashion' && c.id !== 'rosa_fashion' && c.id !== 'branco' && c.id !== 'prateado'
    );
    const hairColor = pick(naturalColors, rng).id;

    // Facial hair (only generated as trait for Masculino / Outro, hidden automatically when young)
    let facialHair = 'none';
    let mustacheStyle = 'none';
    if (gender === 'Masculino' && rng() < 0.42) {
      facialHair = pick(FACIAL_HAIR_STYLES.filter(f => f.id !== 'none'), rng).id;
    }
    if (gender === 'Masculino' && rng() < 0.25) {
      mustacheStyle = pick(MUSTACHE_STYLES.filter(m => m.id !== 'none'), rng).id;
    }

    // Accessories
    const glasses = rng() < 0.22 ? pick(GLASSES_STYLES.filter(g => g.id !== 'none' && g.id !== 'sunglasses'), rng).id : 'none';
    let earrings = 'none';
    if (gender === 'Feminino' && rng() < 0.48) {
      earrings = pick(EARRING_STYLES.filter(e => e.id !== 'none'), rng).id;
    } else if (rng() < 0.08) {
      earrings = 'stud';
    }

    const freckles = rng() < 0.16;
    const facialMark = rng() < 0.15 ? pick(FACIAL_MARK_STYLES.filter(m => m.id !== 'none'), rng).id : 'none';

    const shirtColor = pick(SHIRT_COLORS, rng);
    const backgroundColor = pick(BACKDROP_COLORS, rng);

    return {
      characterId,
      appearanceSeed: cleanSeed,
      faceShape,
      skinTone,
      eyeStyle,
      eyeColor,
      eyebrowStyle,
      noseStyle,
      mouthStyle,
      hairStyle,
      hairColor,
      facialHair,
      mustacheStyle,
      accessories: {
        glasses,
        earrings,
        freckles,
        facialMark,
      },
      shirtColor,
      backgroundColor,
    };
  }

  /**
   * Deterministic genetic inheritance from both parents to a descendant.
   * Blends skin tone, selects eye/hair/facial traits from parents with small natural variation.
   */
  static inheritFromParents(
    childId: string,
    childSeed: string,
    gender: 'Masculino' | 'Feminino' | 'Outro',
    father?: CharacterAppearance,
    mother?: CharacterAppearance
  ): CharacterAppearance {
    if (!father && !mother) {
      return this.generateFromSeed(childSeed, { characterId: childId, gender });
    }
    const base = this.generateFromSeed(childSeed, { characterId: childId, gender });
    const rng = createSeededRng(`${childSeed}_inherit_${father?.appearanceSeed || ''}_${mother?.appearanceSeed || ''}`);

    const fToneIdx = father ? SKIN_TONES.findIndex(s => s.id === father.skinTone) : -1;
    const mToneIdx = mother ? SKIN_TONES.findIndex(s => s.id === mother.skinTone) : -1;
    let skinTone = base.skinTone;
    if (fToneIdx >= 0 && mToneIdx >= 0) {
      const avg = Math.round((fToneIdx + mToneIdx) / 2);
      const jitter = Math.floor(rng() * 3) - 1; // -1, 0, +1
      const finalIdx = Math.max(0, Math.min(SKIN_TONES.length - 1, avg + jitter));
      skinTone = SKIN_TONES[finalIdx].id;
    } else if (fToneIdx >= 0 || mToneIdx >= 0) {
      const idx = fToneIdx >= 0 ? fToneIdx : mToneIdx;
      const finalIdx = Math.max(0, Math.min(SKIN_TONES.length - 1, idx + (Math.floor(rng() * 3) - 1)));
      skinTone = SKIN_TONES[finalIdx].id;
    }

    const pickParentTrait = <K extends keyof CharacterAppearance>(key: K, fallback: CharacterAppearance[K]) => {
      const r = rng();
      if (r < 0.45 && father) return father[key];
      if (r < 0.90 && mother) return mother[key];
      return fallback;
    };

    const faceShape = pickParentTrait('faceShape', base.faceShape) as string;
    const eyeStyle = pickParentTrait('eyeStyle', base.eyeStyle) as string;
    const eyeColor = pickParentTrait('eyeColor', base.eyeColor) as string;
    const noseStyle = pickParentTrait('noseStyle', base.noseStyle) as string;
    const mouthStyle = pickParentTrait('mouthStyle', base.mouthStyle) as string;
    const eyebrowStyle = pickParentTrait('eyebrowStyle', base.eyebrowStyle) as string;
    const hairColor = pickParentTrait('hairColor', base.hairColor) as string;

    const freckles =
      (father?.accessories.freckles || mother?.accessories.freckles)
        ? rng() < 0.55
        : rng() < 0.08;

    return {
      ...base,
      characterId: childId,
      appearanceSeed: childSeed,
      faceShape,
      skinTone,
      eyeStyle,
      eyeColor,
      eyebrowStyle,
      noseStyle,
      mouthStyle,
      hairColor,
      accessories: {
        ...base.accessories,
        freckles,
      },
    };
  }

  /**
   * Derives a coherent parent appearance from a player character's appearance,
   * ensuring parents and player visibly share genetics (skin, eyes, hair, face traits).
   */
  static deriveParentFromChild(
    parentId: string,
    parentSeed: string,
    relation: 'Pai' | 'Mãe' | 'Avô' | 'Avó',
    childAppearance: CharacterAppearance
  ): CharacterAppearance {
    const gender: 'Masculino' | 'Feminino' = relation === 'Pai' || relation === 'Avô' ? 'Masculino' : 'Feminino';
    const base = this.generateFromSeed(parentSeed, { characterId: parentId, gender });
    const rng = createSeededRng(`${parentSeed}_parent_of_${childAppearance.appearanceSeed}`);

    const childToneIdx = SKIN_TONES.findIndex(s => s.id === childAppearance.skinTone);
    let skinTone = base.skinTone;
    if (childToneIdx >= 0) {
      const shift = Math.floor(rng() * 3) - 1;
      const idx = Math.max(0, Math.min(SKIN_TONES.length - 1, childToneIdx + shift));
      skinTone = SKIN_TONES[idx].id;
    }

    return {
      ...base,
      characterId: parentId,
      appearanceSeed: parentSeed,
      skinTone,
      eyeColor: rng() < 0.65 ? childAppearance.eyeColor : base.eyeColor,
      hairColor: rng() < 0.65 ? childAppearance.hairColor : base.hairColor,
      faceShape: rng() < 0.5 ? childAppearance.faceShape : base.faceShape,
      noseStyle: rng() < 0.5 ? childAppearance.noseStyle : base.noseStyle,
      eyeStyle: rng() < 0.45 ? childAppearance.eyeStyle : base.eyeStyle,
    };
  }
}
