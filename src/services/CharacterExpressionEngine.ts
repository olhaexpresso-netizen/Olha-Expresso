import { Character, FacialExpression, LifeEvent } from '../types';

export interface ExpressionModifiers {
  expression: FacialExpression;
  leftBrowAngle: number; // degrees
  rightBrowAngle: number; // degrees
  browOffsetY: number;
  eyeScaleY: number;
  pupilScale: number;
  upperLidDrop: number; // 0..1
  lowerLidLift: number; // 0..1
  mouthCurve: number; // positive = smile, negative = frown
  mouthOpenness: number; // 0..1
  mouthWidthScale: number; // adapts cleanly for babies vs adults
  mouthType:
    | 'neutral'
    | 'smile_teeth'
    | 'smile_baby'
    | 'smile_closed'
    | 'sad'
    | 'cry_baby'
    | 'frown_open'
    | 'angry'
    | 'surprised_o'
    | 'worried'
    | 'tired';
  sweatDrop?: boolean;
  tears?: boolean;
  blushBoost?: number;
}

export const ALL_EXPRESSIONS: FacialExpression[] = [
  'Neutra',
  'Feliz',
  'Triste',
  'Choro',
  'Assustada',
  'Irritada',
  'Surpresa',
  'Preocupada',
  'Cansada',
];

export class CharacterExpressionEngine {
  static getModifiers(
    expression: FacialExpression = 'Neutra',
    ageMonths = 300
  ): ExpressionModifiers {
    const isBaby = ageMonths < 24;
    const isToddlerOrChild = ageMonths >= 24 && ageMonths < 144;
    const isElderly = ageMonths >= 780;

    // Gentle mouth scale adaptation so infant expressions look natural and never oversized
    const baseMouthScale = isBaby ? 0.84 : isToddlerOrChild ? 0.92 : isElderly ? 0.94 : 1.0;

    switch (expression) {
      case 'Feliz':
        return {
          expression,
          leftBrowAngle: isBaby ? -2 : -4,
          rightBrowAngle: isBaby ? 2 : 4,
          browOffsetY: isBaby ? -1.4 : -2.2,
          eyeScaleY: isBaby ? 0.96 : 0.92,
          pupilScale: isBaby ? 1.12 : 1.05,
          upperLidDrop: 0,
          lowerLidLift: isBaby ? 0.18 : 0.25,
          mouthCurve: isBaby ? 7 : 8,
          mouthOpenness: isBaby ? 0.45 : 0.7,
          mouthWidthScale: baseMouthScale,
          // Babies < 10 months show gummy baby smile rather than full adult teeth row
          mouthType: ageMonths < 10 ? 'smile_baby' : 'smile_teeth',
          blushBoost: isBaby ? 0.28 : 0.2,
        };

      case 'Choro':
        return {
          expression,
          leftBrowAngle: -16,
          rightBrowAngle: 16,
          browOffsetY: isBaby ? 0.6 : 1.2,
          eyeScaleY: isBaby ? 0.55 : 0.65,
          pupilScale: 1.0,
          upperLidDrop: isBaby ? 0.42 : 0.35,
          lowerLidLift: 0.35,
          mouthCurve: -8,
          mouthOpenness: 0.9,
          mouthWidthScale: isBaby ? 0.92 : baseMouthScale,
          mouthType: 'cry_baby',
          tears: true,
          blushBoost: isBaby ? 0.32 : 0.18,
        };

      case 'Triste':
        if (ageMonths < 12) {
          // Young babies express strong distress closer to tearful pout
          return {
            expression,
            leftBrowAngle: -14,
            rightBrowAngle: 14,
            browOffsetY: 0.8,
            eyeScaleY: 0.84,
            pupilScale: 1.05,
            upperLidDrop: 0.2,
            lowerLidLift: 0.15,
            mouthCurve: -6,
            mouthOpenness: 0.25,
            mouthWidthScale: baseMouthScale,
            mouthType: 'sad',
            tears: true,
            blushBoost: 0.16,
          };
        }
        return {
          expression,
          leftBrowAngle: -14,
          rightBrowAngle: 14,
          browOffsetY: 1.2,
          eyeScaleY: 0.88,
          pupilScale: 1.0,
          upperLidDrop: 0.25,
          lowerLidLift: 0,
          mouthCurve: -6,
          mouthOpenness: 0,
          mouthWidthScale: baseMouthScale,
          mouthType: 'sad',
        };

      case 'Assustada':
        return {
          expression,
          leftBrowAngle: -12,
          rightBrowAngle: 12,
          browOffsetY: isBaby ? -3.2 : -4.5,
          eyeScaleY: 1.24,
          pupilScale: 0.72,
          upperLidDrop: 0,
          lowerLidLift: 0,
          mouthCurve: -3,
          mouthOpenness: 0.65,
          mouthWidthScale: baseMouthScale,
          mouthType: 'frown_open',
          sweatDrop: !isBaby,
        };

      case 'Irritada':
        return {
          expression,
          leftBrowAngle: isBaby ? 11 : 17,
          rightBrowAngle: isBaby ? -11 : -17,
          browOffsetY: isBaby ? 1.8 : 2.8,
          eyeScaleY: 0.82,
          pupilScale: 0.92,
          upperLidDrop: 0.28,
          lowerLidLift: 0.15,
          mouthCurve: -4,
          mouthOpenness: 0.2,
          mouthWidthScale: baseMouthScale,
          mouthType: isBaby ? 'sad' : 'angry',
          blushBoost: isBaby ? 0.15 : 0.08,
        };

      case 'Surpresa':
        return {
          expression,
          leftBrowAngle: -6,
          rightBrowAngle: 6,
          browOffsetY: isBaby ? -3.4 : -5.0,
          eyeScaleY: 1.22,
          pupilScale: 0.9,
          upperLidDrop: 0,
          lowerLidLift: 0,
          mouthCurve: 0,
          mouthOpenness: 0.8,
          mouthWidthScale: baseMouthScale,
          mouthType: 'surprised_o',
        };

      case 'Preocupada':
        return {
          expression,
          leftBrowAngle: -11,
          rightBrowAngle: 11,
          browOffsetY: -1.2,
          eyeScaleY: 0.96,
          pupilScale: 0.95,
          upperLidDrop: 0.1,
          lowerLidLift: 0.1,
          mouthCurve: -3.5,
          mouthOpenness: 0,
          mouthWidthScale: baseMouthScale,
          mouthType: 'worried',
          sweatDrop: !isBaby,
        };

      case 'Cansada':
        return {
          expression,
          leftBrowAngle: -4,
          rightBrowAngle: 4,
          browOffsetY: 1.8,
          eyeScaleY: isElderly ? 0.62 : 0.65,
          pupilScale: 0.95,
          upperLidDrop: 0.45,
          lowerLidLift: 0.1,
          mouthCurve: -1.5,
          mouthOpenness: 0.15,
          mouthWidthScale: baseMouthScale,
          mouthType: 'tired',
        };

      case 'Neutra':
      default:
        return {
          expression: 'Neutra',
          leftBrowAngle: 0,
          rightBrowAngle: 0,
          browOffsetY: 0,
          eyeScaleY: isElderly ? 0.95 : 1.0,
          pupilScale: 1.0,
          upperLidDrop: isElderly ? 0.08 : 0,
          lowerLidLift: 0,
          mouthCurve: isBaby ? 2.8 : 2.5,
          mouthOpenness: 0,
          mouthWidthScale: baseMouthScale,
          mouthType: 'smile_closed',
        };
    }
  }

  static resolveFromCharacter(character: Partial<Character>): FacialExpression {
    if (character.status === 'Preso') return 'Preocupada';
    if (character.status === 'Morto') return 'Triste';
    const health = character.health ?? 80;
    const happiness = character.happiness ?? 70;
    const stability = character.emotionalStability ?? 70;
    const ageMonths = character.ageMonths ?? (character.currentAge ?? 25) * 12;

    if (ageMonths < 24 && happiness <= 35) return 'Choro';
    if (health < 25) return 'Cansada';
    if (happiness >= 75) return 'Feliz';
    if (happiness <= 25) return 'Triste';
    if (stability <= 30) return 'Preocupada';
    if (health <= 45) return 'Cansada';
    return 'Neutra';
  }

  static resolveFromEvent(event: LifeEvent): FacialExpression {
    const text = `${event.title} ${event.description}`.toLowerCase();
    if (event.age < 2 && (text.includes('chorar') || text.includes('choro'))) {
      return 'Choro';
    }
    if (event.category === 'Crime' || text.includes('prisão') || text.includes('polícia')) {
      return 'Assustada';
    }
    if (text.includes('inflação') || text.includes('dívida') || text.includes('demit') || text.includes('doença')) {
      return 'Preocupada';
    }
    if (text.includes('nascimento') || text.includes('formatura') || text.includes('churrasco') || text.includes('contratado') || text.includes('festa')) {
      return 'Feliz';
    }
    if (text.includes('falec') || text.includes('fim da linha') || text.includes('perda')) {
      return 'Triste';
    }
    if (event.category === 'Carreira' || event.category === 'Aleatório') {
      return 'Surpresa';
    }
    return 'Neutra';
  }
}
