import React, { useId, useMemo } from 'react';
import { Character, CharacterAppearance, FacialExpression, FamilyMember } from '../types';
import { CharacterVisualEngine, LayeredVisualModel } from '../services/CharacterVisualEngine';
import { CharacterExpressionEngine } from '../services/CharacterExpressionEngine';
import { AdvancedLifecycleVisualEngine, FacialProportions } from '../services/AdvancedLifecycleVisualEngine';
import { FaceShapeDef } from '../services/CharacterFaceLibrary';
import { createSeededRng } from '../services/CharacterAppearanceGenerator';

export interface CharacterFaceRendererProps {
  character?: Character;
  familyMember?: FamilyMember;
  appearance?: CharacterAppearance;
  seed?: string;
  characterId?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
  age?: number;
  ageMonths?: number;
  expression?: FacialExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showAgeBadge?: boolean;
  className?: string;
}

const SIZE_MAP: Record<NonNullable<CharacterFaceRendererProps['size']>, string> = {
  xs: 'w-9 h-9',
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32 sm:w-36 sm:h-36',
  '2xl': 'w-44 h-44 sm:w-52 sm:h-52',
  full: 'w-full h-full',
};

function blendHex(hexA: string, hexB: string, factor: number): string {
  const f = Math.max(0, Math.min(1, factor));
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
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r1 + (r2 - r1) * f)}${toHex(g1 + (g2 - g1) * f)}${toHex(b1 + (b2 - b1) * f)}`;
}

interface HeadGeometry {
  path: string;
  topY: number;
  chinY: number;
  cheekWidth: number;
  jawWidth: number;
  templeWidth: number;
}

/**
 * Builds a continuous, anatomically morphing head SVG path preserving the character's
 * permanent faceShape trait while smoothly evolving skull roundness, cheek volume,
 * jaw contour, and chin length across 0m..1440m.
 */
function buildMorphableHeadGeometry(faceShape: FaceShapeDef, p: FacialProportions): HeadGeometry {
  const plump = Math.max(0, p.cheekVolume);
  const gaunt = Math.max(0, -p.cheekVolume);

  // Shape modifiers specific to the 12 face shape identities
  let templeMod = 1.0;
  let cheekMod = 1.0;
  let jawMod = faceShape.jawWidthFactor;
  let topOffset = 0;

  switch (faceShape.id) {
    case 'redondo':
      templeMod = 1.04;
      cheekMod = 1.07;
      topOffset = 2;
      break;
    case 'quadrado':
      templeMod = 1.03;
      cheekMod = 1.03;
      jawMod = Math.max(jawMod, 1.13);
      break;
    case 'alongado':
      templeMod = 0.94;
      cheekMod = 0.93;
      topOffset = -3;
      break;
    case 'largo':
      templeMod = 1.07;
      cheekMod = 1.1;
      break;
    case 'fino':
      templeMod = 0.92;
      cheekMod = 0.9;
      break;
    case 'coracao':
      templeMod = 1.06;
      cheekMod = 1.02;
      jawMod = 0.86;
      break;
    case 'diamante':
      templeMod = 0.95;
      cheekMod = 1.06;
      jawMod = 0.88;
      break;
    case 'triangulo_invertido':
      templeMod = 1.07;
      cheekMod = 1.0;
      jawMod = 0.86;
      break;
    case 'pera':
      templeMod = 0.95;
      cheekMod = 1.02;
      jawMod = 1.1;
      break;
    case 'infantil':
      templeMod = 1.04;
      cheekMod = 1.08;
      topOffset = 2;
      break;
    default:
      break;
  }

  const topY = 52 + topOffset - Math.max(0, p.skullRoundness) * 1.5;
  const chinBaseDelta = (faceShape.chinY - 104) * p.chinSizeScale * p.headScaleY;
  const chinY = Math.max(139, Math.min(161, 104 + chinBaseDelta - plump * 3.5));

  // Horizontal widths from center x=100
  const templeWidth = (36.5 * templeMod + Math.max(0, p.skullRoundness) * 3.2) * p.headScaleX;
  const cheekWidth = (42.5 * cheekMod + plump * 5.8 - gaunt * 3.2) * p.headScaleX;
  const jawWidth = (34.5 * jawMod * p.jawWidthScale + plump * 7.2 - gaunt * 4.5) * p.headScaleX;

  const templeY = topY + 20;
  const cheekY = 104 + p.eyeOffsetY * 0.45;
  const jawY = chinY - 16 - plump * 2;
  const chinCtrlOffset = faceShape.id === 'quadrado' ? 21 * p.jawWidthScale : 15 * p.jawWidthScale + plump * 4;

  const path = [
    `M 100 ${topY.toFixed(1)}`,
    `C ${(100 + templeWidth * 0.68).toFixed(1)} ${topY.toFixed(1)}, ${(100 + templeWidth).toFixed(1)} ${(topY + 9).toFixed(1)}, ${(100 + cheekWidth).toFixed(1)} ${cheekY.toFixed(1)}`,
    `C ${(100 + cheekWidth + plump * 2.5).toFixed(1)} ${(cheekY + 14).toFixed(1)}, ${(100 + jawWidth).toFixed(1)} ${jawY.toFixed(1)}, ${(100 + chinCtrlOffset).toFixed(1)} ${(chinY - 2).toFixed(1)}`,
    `Q 100 ${(chinY + 2).toFixed(1)} ${(100 - chinCtrlOffset).toFixed(1)} ${(chinY - 2).toFixed(1)}`,
    `C ${(100 - jawWidth).toFixed(1)} ${jawY.toFixed(1)}, ${(100 - cheekWidth - plump * 2.5).toFixed(1)} ${(cheekY + 14).toFixed(1)}, ${(100 - cheekWidth).toFixed(1)} ${cheekY.toFixed(1)}`,
    `C ${(100 - templeWidth).toFixed(1)} ${(topY + 9).toFixed(1)}, ${(100 - templeWidth * 0.68).toFixed(1)} ${topY.toFixed(1)}, 100 ${topY.toFixed(1)}`,
    'Z',
  ].join(' ');

  return {
    path,
    topY,
    chinY,
    cheekWidth,
    jawWidth,
    templeWidth,
  };
}

function renderEar(
  cx: number,
  cy: number,
  earScale: number,
  isRight: boolean,
  skinBase: string,
  skinShadow: string,
  outline: string,
  earringsType: string
) {
  const dir = isRight ? 1 : -1;
  const rx = 6.4 * earScale;
  const ry = 9.8 * earScale;
  return (
    <g key={isRight ? 'ear-r' : 'ear-l'}>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={skinBase}
        stroke={outline}
        strokeWidth={2.0}
      />
      <path
        d={`M ${cx - dir * 1.4 * earScale} ${cy - 4.2 * earScale} Q ${cx + dir * 2.8 * earScale} ${cy} ${cx - dir * 1 * earScale} ${cy + 4.2 * earScale}`}
        fill="none"
        stroke={skinShadow}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      {earringsType === 'stud' && (
        <circle cx={cx + dir * 1.2} cy={cy + ry * 0.78} r={2.2} fill="#FBBF24" stroke="#78350F" strokeWidth={1.0} />
      )}
      {earringsType === 'hoop' && (
        <circle cx={cx + dir * 1.5} cy={cy + ry * 1.12} r={4.2} fill="none" stroke="#F59E0B" strokeWidth={1.9} />
      )}
      {earringsType === 'drop' && (
        <g>
          <circle cx={cx + dir * 1.2} cy={cy + ry * 0.78} r={1.7} fill="#F59E0B" stroke="#78350F" strokeWidth={0.9} />
          <ellipse cx={cx + dir * 1.2} cy={cy + ry * 1.4} rx={2.4} ry={4.0} fill="#38BDF8" stroke="#0369A1" strokeWidth={1.0} />
        </g>
      )}
    </g>
  );
}

function renderEye(
  cx: number,
  cy: number,
  isRight: boolean,
  model: LayeredVisualModel,
  skinBase: string,
  clipId: string
) {
  const { eyeStyle, eyeColor, skinTone, expression, lifecycle } = model;
  const p = lifecycle.proportions;
  const skin = lifecycle.skin;

  const rx = eyeStyle.rx * p.eyeScale;
  const ry = Math.max(2.3, eyeStyle.ry * p.eyeScale * expression.eyeScaleY);
  const tilt = isRight ? -eyeStyle.tiltDeg : eyeStyle.tiltDeg;
  const irisR = Math.min(ry * 0.89, eyeStyle.irisRadius * p.eyeScale);
  const pupilR = Math.max(1.1, eyeStyle.pupilRadius * p.eyeScale * expression.pupilScale);

  const upperDrop = expression.upperLidDrop * ry * 1.75;
  const lowerLift = expression.lowerLidLift * ry * 1.45;

  return (
    <g key={isRight ? 'eye-r' : 'eye-l'} transform={`rotate(${tilt} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" />

      <g clipPath={`url(#${clipId})`}>
        <rect x={cx - rx - 2} y={cy - ry - 1} width={rx * 2 + 4} height={ry * 0.35} fill="#E2E8F0" opacity={0.62} />
        <circle cx={cx} cy={cy + 0.3} r={irisR} fill={eyeColor.hex} stroke={eyeColor.ringHex} strokeWidth={0.9} />
        <circle cx={cx} cy={cy + 0.3} r={pupilR} fill="#0F172A" />
        <circle cx={cx + irisR * 0.35} cy={cy - irisR * 0.32} r={Math.max(1.0, irisR * 0.28)} fill="#FFFFFF" />
        <circle cx={cx - irisR * 0.3} cy={cy + irisR * 0.3} r={Math.max(0.55, irisR * 0.14)} fill="#FFFFFF" opacity={0.85} />

        {/* Subtle aged upper eyelid fold for elderly stages */}
        {skin.underEyeHollowOpacity > 0.2 && upperDrop <= 0.1 && (
          <rect
            x={cx - rx - 2}
            y={cy - ry - 1.5}
            width={rx * 2 + 4}
            height={ry * 0.26 * skin.underEyeHollowOpacity + 1.5}
            fill={skinBase}
            stroke={skinTone.shadow}
            strokeWidth={0.9}
          />
        )}

        {upperDrop > 0.1 && (
          <rect
            x={cx - rx - 2}
            y={cy - ry - 2}
            width={rx * 2 + 4}
            height={upperDrop + 2}
            fill={skinBase}
            stroke={skinTone.outline}
            strokeWidth={1.6}
          />
        )}

        {lowerLift > 0.1 && (
          <ellipse
            cx={cx}
            cy={cy + ry + 3 - lowerLift}
            rx={rx + 2}
            ry={ry * 0.8}
            fill={skinBase}
            stroke={skinTone.shadow}
            strokeWidth={1.1}
          />
        )}
      </g>

      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={skinTone.outline} strokeWidth={1.6} />

      {(eyeStyle.lashStyle === 'subtle' || eyeStyle.lashStyle === 'winged' || eyeStyle.lashStyle === 'thick') && (
        <path
          d={`M ${cx - rx} ${cy} Q ${cx} ${cy - ry - 1.2} ${cx + rx + (isRight && eyeStyle.lashStyle !== 'subtle' ? 2.4 : 0)} ${cy - (isRight && eyeStyle.lashStyle !== 'subtle' ? 1.6 : 0)}`}
          fill="none"
          stroke={skinTone.outline}
          strokeWidth={eyeStyle.lashStyle === 'thick' ? 2.4 : 1.95}
          strokeLinecap="round"
        />
      )}
      {!isRight && (eyeStyle.lashStyle === 'winged' || eyeStyle.lashStyle === 'thick') && (
        <path
          d={`M ${cx - rx - 2.4} ${cy - 1.6} Q ${cx} ${cy - ry - 1.2} ${cx + rx} ${cy}`}
          fill="none"
          stroke={skinTone.outline}
          strokeWidth={eyeStyle.lashStyle === 'thick' ? 2.4 : 1.95}
          strokeLinecap="round"
        />
      )}

      {/* Tears for crying / sad infant */}
      {expression.tears && (
        <g>
          <path
            d={`M ${cx + (isRight ? 2 : -2)} ${cy + ry + 0.5} C ${cx + (isRight ? 4.5 : -4.5)} ${cy + ry + 5}, ${cx + (isRight ? 4 : -4)} ${cy + ry + 9.5}, ${cx + (isRight ? 2 : -2)} ${cy + ry + 11.5} C ${cx} ${cy + ry + 9.5}, ${cx} ${cy + ry + 5}, ${cx + (isRight ? 2 : -2)} ${cy + ry + 0.5} Z`}
            fill="#60A5FA"
            opacity={0.85}
          />
          <ellipse cx={cx} cy={cy + ry + 1} rx={rx * 0.65} ry={1.4} fill="#93C5FD" opacity={0.85} />
        </g>
      )}
    </g>
  );
}

function renderEyebrow(cx: number, cy: number, isRight: boolean, model: LayeredVisualModel) {
  const { eyebrowStyle, expression, resolvedEyebrowHex, lifecycle } = model;
  const ageYears = lifecycle.ageYears;
  const halfLen = (eyebrowStyle.length / 2) * (ageYears < 3 ? 0.78 : ageYears < 10 ? 0.88 : 1.0);
  const arch = eyebrowStyle.arch;
  const angle = isRight ? expression.rightBrowAngle : expression.leftBrowAngle;
  const y = cy + expression.browOffsetY;
  const dir = isRight ? 1 : -1;

  // Babies have soft delicate thin eyebrows; elderly lose slight thickness
  const ageThicknessScale = ageYears < 1 ? 0.45 : ageYears < 4 ? 0.65 : ageYears < 12 ? 0.82 : ageYears > 75 ? 0.84 : 1.0;
  const thickness = Math.max(1.1, eyebrowStyle.thickness * ageThicknessScale);
  const opacity = ageYears < 1 ? 0.52 : ageYears < 3 ? 0.75 : Math.max(0.65, 1 - lifecycle.hair.thinningFactor * 0.25);

  let path = `M ${cx - halfLen} ${y + 1} Q ${cx + dir * 1} ${y - arch} ${cx + halfLen} ${y + 1}`;
  if (eyebrowStyle.style === 'straight') {
    path = `M ${cx - halfLen} ${y} L ${cx + halfLen} ${y}`;
  } else if (eyebrowStyle.style === 'angular') {
    path = `M ${cx - halfLen} ${y + 1.5} L ${cx + dir * 2} ${y - arch} L ${cx + halfLen} ${y + 0.5}`;
  }

  return (
    <path
      key={isRight ? 'brow-r' : 'brow-l'}
      d={path}
      fill="none"
      stroke={resolvedEyebrowHex}
      strokeWidth={thickness}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      transform={`rotate(${angle} ${cx} ${y})`}
    />
  );
}

function renderNose(topY: number, model: LayeredVisualModel) {
  const { noseStyle, skinTone, lifecycle } = model;
  const p = lifecycle.proportions;
  const w = noseStyle.width * p.noseWidthScale;
  const h = noseStyle.height * p.noseLengthScale;
  const tipY = topY + h;

  // Babies & small children have softer button-like nose silhouette
  if (lifecycle.ageMonths < 24 || noseStyle.type === 'pequeno' || noseStyle.type === 'arredondado') {
    return (
      <g>
        <path
          d={`M ${100 - w * 0.55} ${tipY - 2} Q 100 ${tipY + 3.2} ${100 + w * 0.55} ${tipY - 2}`}
          fill={skinTone.shadow}
          opacity={0.42}
        />
        <path
          d={`M ${100 - w * 0.5} ${tipY - 1.5} Q 100 ${tipY + 2.8} ${100 + w * 0.5} ${tipY - 1.5}`}
          fill="none"
          stroke={skinTone.outline}
          strokeWidth={lifecycle.ageMonths < 12 ? 1.35 : 1.65}
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (noseStyle.type === 'largo') {
    return (
      <g>
        <path
          d={`M 99 ${topY + 2} L 97 ${tipY - 3} Q 100 ${tipY + 3} ${100 + w * 0.55} ${tipY - 1.5}`}
          fill="none"
          stroke={skinTone.outline}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx={100 - w * 0.35} cy={tipY - 1} rx={1.6} ry={1.1} fill={skinTone.shadow} />
        <ellipse cx={100 + w * 0.35} cy={tipY - 1} rx={1.6} ry={1.1} fill={skinTone.shadow} />
      </g>
    );
  }

  return (
    <g>
      <path
        d={`M 101 ${topY} Q ${100 + w * 0.35} ${tipY - 4} ${100 + w * 0.25} ${tipY - 0.5} Q 100 ${tipY + 2.5} ${100 - w * 0.4} ${tipY - 1}`}
        fill="none"
        stroke={skinTone.outline}
        strokeWidth={1.68}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function renderMouth(cy: number, model: LayeredVisualModel, lipHex: string) {
  const { mouthStyle, expression, skinTone, lifecycle } = model;
  const p = lifecycle.proportions;
  const cx = 100;
  const hw = (mouthStyle.width / 2) * expression.mouthWidthScale;
  const lipH = 3.0 * mouthStyle.lipFullness * p.lipVolumeScale;
  const outline = skinTone.outline;

  switch (expression.mouthType) {
    case 'smile_baby': {
      return (
        <g>
          <path
            d={`M ${cx - hw} ${cy - 1} Q ${cx} ${cy + 11.5} ${cx + hw} ${cy - 1} Q ${cx} ${cy + 1.5} ${cx - hw} ${cy - 1} Z`}
            fill="#9F1239"
            stroke={outline}
            strokeWidth={1.45}
            strokeLinejoin="round"
          />
          <ellipse cx={cx} cy={cy + 4.8} rx={hw * 0.52} ry={2.2} fill="#FB7185" opacity={0.85} />
        </g>
      );
    }

    case 'cry_baby': {
      return (
        <g>
          <path
            d={`M ${cx - hw * 0.95} ${cy + 3.5} Q ${cx} ${cy - 6} ${cx + hw * 0.95} ${cy + 3.5} Q ${cx} ${cy + 10.5} ${cx - hw * 0.95} ${cy + 3.5} Z`}
            fill="#881337"
            stroke={outline}
            strokeWidth={1.55}
            strokeLinejoin="round"
          />
          <ellipse cx={cx} cy={cy + 4.2} rx={hw * 0.45} ry={2.1} fill="#FB7185" opacity={0.85} />
        </g>
      );
    }

    case 'smile_teeth': {
      return (
        <g>
          <path
            d={`M ${cx - hw} ${cy - 1} Q ${cx} ${cy + 13.5} ${cx + hw} ${cy - 1} Q ${cx} ${cy + 2} ${cx - hw} ${cy - 1} Z`}
            fill="#7F1D1D"
            stroke={outline}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path
            d={`M ${cx - hw + 2.5} ${cy} Q ${cx} ${cy + 2.2} ${cx + hw - 2.5} ${cy} L ${cx + hw - 4.5} ${cy + 4.2} Q ${cx} ${cy + 5.2} ${cx - hw + 4.5} ${cy + 4.2} Z`}
            fill="#FFFFFF"
          />
          <ellipse cx={cx} cy={cy + 7.2} rx={hw * 0.45} ry={2.3} fill="#F43F5E" opacity={0.85} />
        </g>
      );
    }

    case 'surprised_o': {
      return (
        <ellipse
          cx={cx}
          cy={cy + 2}
          rx={5.2 * expression.mouthWidthScale}
          ry={6.8 * expression.mouthWidthScale}
          fill="#7F1D1D"
          stroke={lipHex}
          strokeWidth={Math.max(1.4, 2.1 * p.lipVolumeScale)}
        />
      );
    }

    case 'frown_open': {
      return (
        <g>
          <path
            d={`M ${cx - hw * 0.85} ${cy + 4} Q ${cx} ${cy - 5} ${cx + hw * 0.85} ${cy + 4} Q ${cx} ${cy + 8} ${cx - hw * 0.85} ${cy + 4} Z`}
            fill="#7F1D1D"
            stroke={outline}
            strokeWidth={1.55}
          />
          {lifecycle.ageMonths >= 10 && (
            <path
              d={`M ${cx - hw * 0.5} ${cy + 1.5} Q ${cx} ${cy - 1} ${cx + hw * 0.5} ${cy + 1.5}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={1.9}
              strokeLinecap="round"
            />
          )}
        </g>
      );
    }

    case 'angry': {
      return (
        <g>
          <path
            d={`M ${cx - hw * 0.85} ${cy + 3.5} Q ${cx} ${cy - 4} ${cx + hw * 0.85} ${cy + 3.5}`}
            fill="none"
            stroke={outline}
            strokeWidth={2.0}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - hw * 0.6} ${cy + 2.5} L ${cx + hw * 0.6} ${cy + 2.5}`}
            stroke="#FFFFFF"
            strokeWidth={2.0}
            strokeLinecap="round"
          />
        </g>
      );
    }

    case 'sad':
    case 'worried': {
      return (
        <g>
          <path
            d={`M ${cx - hw * 0.85} ${cy + 4} Q ${cx} ${cy - 4.5} ${cx + hw * 0.85} ${cy + 4}`}
            fill="none"
            stroke={outline}
            strokeWidth={1.85}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - 4} ${cy + 5.5} Q ${cx} ${cy + 6.5} ${cx + 4} ${cy + 5.5}`}
            fill="none"
            stroke={skinTone.shadow}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
        </g>
      );
    }

    case 'tired': {
      return (
        <ellipse
          cx={cx}
          cy={cy + 2}
          rx={4.8 * expression.mouthWidthScale}
          ry={2.1}
          fill="#991B1B"
          stroke={outline}
          strokeWidth={1.5}
        />
      );
    }

    case 'smile_closed':
    default: {
      return (
        <g>
          <path
            d={`M ${cx - hw} ${cy} Q ${cx - hw * 0.3} ${cy - lipH * 0.8} ${cx} ${cy - lipH * 0.35} Q ${cx + hw * 0.3} ${cy - lipH * 0.8} ${cx + hw} ${cy} Q ${cx} ${cy + lipH * 1.45} ${cx - hw} ${cy} Z`}
            fill={lipHex}
            opacity={0.78}
          />
          <path
            d={`M ${cx - hw} ${cy} Q ${cx} ${cy + 4.2} ${cx + hw} ${cy}`}
            fill="none"
            stroke={outline}
            strokeWidth={1.75}
            strokeLinecap="round"
          />
        </g>
      );
    }
  }
}

function renderFacialHair(mouthY: number, chinY: number, model: LayeredVisualModel, skinBase: string) {
  const { facialHair, mustache, resolvedBeardHex, resolvedHairShadowHex, lifecycle } = model;
  if (!lifecycle.allowFacialHair || lifecycle.facialHairDensity <= 0.02) {
    return null;
  }

  const color = resolvedBeardHex;
  const stroke = blendHex(resolvedHairShadowHex, '#D1D5DB', lifecycle.hair.beardGrayFactor * 0.85);
  const densityOpacity = lifecycle.facialHairDensity;
  const jawScale = lifecycle.proportions.jawWidthScale * lifecycle.proportions.headScaleX;
  const dy = mouthY - 131;

  return (
    <g opacity={densityOpacity} transform={`translate(100, ${mouthY}) scale(${jawScale}, 1) translate(-100, ${-mouthY})`}>
      {facialHair.type === 'stubble' && (
        <path
          d={`M 62 ${114 + dy} C 62 ${138 + dy}, 78 ${chinY}, 100 ${chinY} C 122 ${chinY}, 138 ${138 + dy}, 138 ${114 + dy} C 134 ${128 + dy}, 120 ${137 + dy}, 100 ${137 + dy} C 80 ${137 + dy}, 66 ${128 + dy}, 62 ${114 + dy} Z`}
          fill={color}
          opacity={0.28}
        />
      )}
      {facialHair.type === 'chinstrap' && (
        <path
          d={`M 59 ${108 + dy} C 59 ${138 + dy}, 77 ${chinY + 1}, 100 ${chinY + 1} C 123 ${chinY + 1}, 141 ${138 + dy}, 141 ${108 + dy} L 137 ${110 + dy} C 136 ${135 + dy}, 120 ${chinY - 6}, 100 ${chinY - 6} C 80 ${chinY - 6}, 64 ${135 + dy}, 63 ${110 + dy} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.2}
        />
      )}
      {facialHair.type === 'goatee' && (
        <path
          d={`M 85 ${137 + dy} C 85 ${chinY - 3}, 92 ${chinY + 3}, 100 ${chinY + 3} C 108 ${chinY + 3}, 115 ${chinY - 3}, 115 ${137 + dy} C 110 ${140 + dy}, 90 ${140 + dy}, 85 ${137 + dy} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.4}
        />
      )}
      {facialHair.type === 'trimmed' && (
        <path
          d={`M 60 ${112 + dy} C 59 ${139 + dy}, 77 ${chinY + 2}, 100 ${chinY + 2} C 123 ${chinY + 2}, 141 ${139 + dy}, 140 ${112 + dy} C 136 ${125 + dy}, 124 ${134 + dy}, 114 ${134 + dy} C 109 ${125 + dy}, 91 ${125 + dy}, 86 ${134 + dy} C 76 ${134 + dy}, 64 ${125 + dy}, 60 ${112 + dy} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.5}
          opacity={0.95}
        />
      )}
      {facialHair.type === 'full' && (
        <path
          d={`M 58 ${107 + dy} C 56 ${142 + dy}, 75 ${chinY + 8}, 100 ${chinY + 8} C 125 ${chinY + 8}, 144 ${142 + dy}, 142 ${107 + dy} C 136 ${123 + dy}, 124 ${129 + dy}, 115 ${129 + dy} C 109 ${123 + dy}, 91 ${123 + dy}, 85 ${129 + dy} C 76 ${129 + dy}, 64 ${123 + dy}, 58 ${107 + dy} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.6}
        />
      )}
      {facialHair.type === 'lumberjack' && (
        <path
          d={`M 57 ${106 + dy} C 55 ${148 + dy}, 72 ${chinY + 20}, 100 ${chinY + 22} C 128 ${chinY + 20}, 145 ${148 + dy}, 143 ${106 + dy} C 136 ${122 + dy}, 124 ${128 + dy}, 115 ${128 + dy} C 109 ${122 + dy}, 91 ${122 + dy}, 85 ${128 + dy} C 76 ${128 + dy}, 64 ${122 + dy}, 57 ${106 + dy} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.7}
        />
      )}

      {(facialHair.type === 'trimmed' || facialHair.type === 'full' || facialHair.type === 'lumberjack') && (
        <ellipse cx={100} cy={mouthY} rx={14} ry={6.5} fill={skinBase} />
      )}

      {mustache.type === 'thin' && (
        <path
          d={`M 85 ${mouthY - 5} Q 93 ${mouthY - 9} 100 ${mouthY - 7} Q 107 ${mouthY - 9} 115 ${mouthY - 5}`}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}
      {mustache.type === 'classic' && (
        <path
          d={`M 82 ${mouthY - 4} C 86 ${mouthY - 10}, 95 ${mouthY - 10}, 100 ${mouthY - 7} C 105 ${mouthY - 10}, 114 ${mouthY - 10}, 118 ${mouthY - 4} C 112 ${mouthY - 5}, 104 ${mouthY - 5}, 100 ${mouthY - 4} C 96 ${mouthY - 5}, 88 ${mouthY - 5}, 82 ${mouthY - 4} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.2}
        />
      )}
      {mustache.type === 'thick' && (
        <path
          d={`M 80 ${mouthY - 3} C 84 ${mouthY - 12}, 95 ${mouthY - 12}, 100 ${mouthY - 8} C 105 ${mouthY - 12}, 116 ${mouthY - 12}, 120 ${mouthY - 3} C 113 ${mouthY - 3}, 104 ${mouthY - 4}, 100 ${mouthY - 3} C 96 ${mouthY - 4}, 87 ${mouthY - 3}, 80 ${mouthY - 3} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.4}
        />
      )}
      {mustache.type === 'handlebar' && (
        <path
          d={`M 76 ${mouthY - 7} C 78 ${mouthY - 2}, 84 ${mouthY - 4}, 88 ${mouthY - 6} C 93 ${mouthY - 9}, 97 ${mouthY - 9}, 100 ${mouthY - 7} C 103 ${mouthY - 9}, 107 ${mouthY - 9}, 112 ${mouthY - 6} C 116 ${mouthY - 4}, 122 ${mouthY - 2}, 124 ${mouthY - 7} C 122 ${mouthY}, 113 ${mouthY - 1}, 106 ${mouthY - 4} C 103 ${mouthY - 5}, 101 ${mouthY - 5}, 100 ${mouthY - 4} C 99 ${mouthY - 5}, 97 ${mouthY - 5}, 94 ${mouthY - 4} C 87 ${mouthY - 1}, 78 ${mouthY}, 76 ${mouthY - 7} Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.2}
        />
      )}
    </g>
  );
}

interface OverlayCoords {
  leftEyeX: number;
  rightEyeX: number;
  eyeY: number;
  noseTopY: number;
  mouthY: number;
  headTopY: number;
  cheekWidth: number;
}

function renderSkinAndAccessories(model: LayeredVisualModel, coords: OverlayCoords) {
  const { appearance, glasses, facialMark, expression, skinTone, lifecycle } = model;
  const skin = lifecycle.skin;
  const { leftEyeX, rightEyeX, eyeY, noseTopY, mouthY, headTopY, cheekWidth } = coords;
  const midEyeDist = rightEyeX - leftEyeX;
  const spotSeedRng = createSeededRng(`${appearance.appearanceSeed}_spots`);

  return (
    <g>
      {/* Freckles */}
      {appearance.accessories.freckles && (
        <g fill={skinTone.shadow} opacity={0.68}>
          <circle cx={leftEyeX - 5} cy={eyeY + 15} r={1.05} />
          <circle cx={leftEyeX - 1} cy={eyeY + 17} r={0.95} />
          <circle cx={leftEyeX - 8} cy={eyeY + 18} r={0.9} />
          <circle cx={leftEyeX + 3} cy={eyeY + 14} r={0.85} />
          <circle cx={rightEyeX + 5} cy={eyeY + 15} r={1.05} />
          <circle cx={rightEyeX + 1} cy={eyeY + 17} r={0.95} />
          <circle cx={rightEyeX + 8} cy={eyeY + 18} r={0.9} />
          <circle cx={rightEyeX - 3} cy={eyeY + 14} r={0.85} />
          <circle cx={97} cy={noseTopY + 9} r={0.85} />
          <circle cx={103} cy={noseTopY + 10} r={0.85} />
        </g>
      )}

      {/* Subtle adolescent acne (13-17y only) */}
      {skin.teenAcneOpacity > 0.05 && (
        <g fill="#E11D48" opacity={skin.teenAcneOpacity * 0.42}>
          <circle cx={leftEyeX - 7} cy={eyeY + 20} r={1.2} />
          <circle cx={rightEyeX + 8} cy={eyeY + 18} r={1.1} />
          <circle cx={94} cy={headTopY + 14} r={1.0} />
          <circle cx={106} cy={mouthY + 12} r={1.1} />
        </g>
      )}

      {/* Facial Marks */}
      {facialMark.type === 'mole_cheek' && (
        <circle cx={leftEyeX - 7} cy={eyeY + 21} r={1.45} fill={skinTone.outline} opacity={0.8} />
      )}
      {facialMark.type === 'mole_lip' && (
        <circle cx={114} cy={mouthY - 4} r={1.35} fill={skinTone.outline} opacity={0.8} />
      )}
      {facialMark.type === 'dimples' && (
        <g stroke={skinTone.shadow} strokeWidth={1.3} fill="none" strokeLinecap="round">
          <path d={`M ${leftEyeX - 5} ${mouthY - 4} Q ${leftEyeX - 7} ${mouthY} ${leftEyeX - 5} ${mouthY + 4}`} />
          <path d={`M ${rightEyeX + 5} ${mouthY - 4} Q ${rightEyeX + 7} ${mouthY} ${rightEyeX + 5} ${mouthY + 4}`} />
        </g>
      )}
      {facialMark.type === 'scar_brow' && (
        <path d={`M ${rightEyeX - 3} ${eyeY - 18} L ${rightEyeX + 3} ${eyeY - 7}`} stroke={skinTone.shadow} strokeWidth={1.7} strokeLinecap="round" />
      )}
      {facialMark.type === 'bandaid' && (
        <g transform={`rotate(-10 100 ${noseTopY + 7})`}>
          <rect x={90} y={noseTopY + 3} width={20} height={7} rx={2.5} fill="#FDE68A" stroke="#D97706" strokeWidth={1.1} />
          <line x1={96} y1={noseTopY + 4.5} x2={96} y2={noseTopY + 8.5} stroke="#D97706" strokeWidth={0.8} opacity={0.5} />
          <line x1={104} y1={noseTopY + 4.5} x2={104} y2={noseTopY + 8.5} stroke="#D97706" strokeWidth={0.8} opacity={0.5} />
        </g>
      )}

      {/* Individualized Skin Aging Overlay (Zero wrinkles under 30; progressive 32..120y) */}
      {skin.wrinkleOpacity > 0.03 && (
        <g stroke={skinTone.shadow} fill="none" strokeLinecap="round">
          {/* Forehead lines */}
          {skin.foreheadLinesOpacity > 0.04 && (
            <g opacity={skin.foreheadLinesOpacity}>
              <path d={`M 80 ${headTopY + 18} Q 100 ${headTopY + 15.5} 120 ${headTopY + 18}`} strokeWidth={1.25} />
              {skin.foreheadLinesOpacity > 0.35 && (
                <path d={`M 85 ${headTopY + 13} Q 100 ${headTopY + 11} 115 ${headTopY + 13}`} strokeWidth={1.05} />
              )}
              {skin.foreheadLinesOpacity > 0.65 && (
                <path d={`M 90 ${headTopY + 23} Q 100 ${headTopY + 21.5} 110 ${headTopY + 23}`} strokeWidth={0.95} />
              )}
            </g>
          )}

          {/* Crow's feet */}
          {skin.crowsFeetOpacity > 0.04 && (
            <g opacity={skin.crowsFeetOpacity}>
              <path d={`M ${leftEyeX - 11} ${eyeY - 1} L ${leftEyeX - 16} ${eyeY - 3} M ${leftEyeX - 11} ${eyeY + 2} L ${leftEyeX - 16} ${eyeY + 3}`} strokeWidth={1.05} />
              <path d={`M ${rightEyeX + 11} ${eyeY - 1} L ${rightEyeX + 16} ${eyeY - 3} M ${rightEyeX + 11} ${eyeY + 2} L ${rightEyeX + 16} ${eyeY + 3}`} strokeWidth={1.05} />
            </g>
          )}

          {/* Under-eye hollows / bags */}
          {skin.underEyeHollowOpacity > 0.05 && (
            <g opacity={skin.underEyeHollowOpacity}>
              <path d={`M ${leftEyeX - 7} ${eyeY + 8.5} Q ${leftEyeX} ${eyeY + 11.5} ${leftEyeX + 7} ${eyeY + 8.5}`} strokeWidth={1.15} />
              <path d={`M ${rightEyeX - 7} ${eyeY + 8.5} Q ${rightEyeX} ${eyeY + 11.5} ${rightEyeX + 7} ${eyeY + 8.5}`} strokeWidth={1.15} />
            </g>
          )}

          {/* Nasolabial folds */}
          {skin.nasolabialOpacity > 0.04 && (
            <g opacity={skin.nasolabialOpacity}>
              <path d={`M 87 ${noseTopY + 14} Q 79 ${mouthY - 4} 78 ${mouthY + 4}`} strokeWidth={1.3} />
              <path d={`M 113 ${noseTopY + 14} Q 121 ${mouthY - 4} 122 ${mouthY + 4}`} strokeWidth={1.3} />
            </g>
          )}

          {/* Marionette lines & cheek sag for elderly & extreme longevity */}
          {skin.marionetteLinesOpacity > 0.05 && (
            <g opacity={skin.marionetteLinesOpacity}>
              <path d={`M 83 ${mouthY + 4} Q 81 ${mouthY + 11} 83 ${mouthY + 16}`} strokeWidth={1.1} />
              <path d={`M 117 ${mouthY + 4} Q 119 ${mouthY + 11} 117 ${mouthY + 16}`} strokeWidth={1.1} />
            </g>
          )}

          {skin.cheekSagOpacity > 0.08 && (
            <g opacity={skin.cheekSagOpacity * 0.65}>
              <path d={`M ${100 - cheekWidth * 0.72} ${eyeY + 16} Q ${100 - cheekWidth * 0.62} ${mouthY + 2} ${100 - cheekWidth * 0.42} ${mouthY + 10}`} strokeWidth={1.2} />
              <path d={`M ${100 + cheekWidth * 0.72} ${eyeY + 16} Q ${100 + cheekWidth * 0.62} ${mouthY + 2} ${100 + cheekWidth * 0.42} ${mouthY + 10}`} strokeWidth={1.2} />
            </g>
          )}
        </g>
      )}

      {/* Age Spots (65+..120y) */}
      {skin.ageSpotsOpacity > 0.05 && (
        <g fill={skinTone.shadow} opacity={skin.ageSpotsOpacity * 0.55}>
          <ellipse cx={leftEyeX - 10 - spotSeedRng() * 3} cy={eyeY + 15} rx={1.6} ry={1.2} />
          <ellipse cx={rightEyeX + 11 + spotSeedRng() * 3} cy={eyeY + 17} rx={1.8} ry={1.3} />
          <circle cx={75 + spotSeedRng() * 6} cy={headTopY + 22} r={1.3} />
          <circle cx={121 + spotSeedRng() * 5} cy={headTopY + 19} r={1.1} />
        </g>
      )}

      {/* Sweat drop for Scared / Worried */}
      {expression.sweatDrop && (
        <path
          d={`M ${100 + cheekWidth * 0.88} ${eyeY - 22} C ${103 + cheekWidth * 0.88} ${eyeY - 17}, ${105 + cheekWidth * 0.88} ${eyeY - 12}, ${100 + cheekWidth * 0.88} ${eyeY - 10} C ${95 + cheekWidth * 0.88} ${eyeY - 12}, ${97 + cheekWidth * 0.88} ${eyeY - 17}, ${100 + cheekWidth * 0.88} ${eyeY - 22} Z`}
          fill="#60A5FA"
          stroke="#1D4ED8"
          strokeWidth={1.1}
        />
      )}

      {/* Glasses aligned dynamically to aged eye spacing & Y-pos */}
      {glasses.type === 'round' && (
        <g stroke={glasses.frameColor} strokeWidth={2.3} fill="rgba(255,255,255,0.14)">
          <circle cx={leftEyeX} cy={eyeY} r={12.5} />
          <circle cx={rightEyeX} cy={eyeY} r={12.5} />
          <path d={`M ${leftEyeX + 12.5} ${eyeY - 1} Q 100 ${eyeY - 4} ${rightEyeX - 12.5} ${eyeY - 1}`} fill="none" />
          <line x1={leftEyeX - 19} y1={eyeY - 2} x2={leftEyeX - 12.5} y2={eyeY - 1} />
          <line x1={rightEyeX + 12.5} y1={eyeY - 1} x2={rightEyeX + 19} y2={eyeY - 2} />
        </g>
      )}
      {glasses.type === 'square' && (
        <g stroke={glasses.frameColor} strokeWidth={2.5} fill="rgba(255,255,255,0.14)">
          <rect x={leftEyeX - 13.5} y={eyeY - 10.5} width={27} height={21} rx={5} />
          <rect x={rightEyeX - 13.5} y={eyeY - 10.5} width={27} height={21} rx={5} />
          <line x1={leftEyeX + 13.5} y1={eyeY - 3} x2={rightEyeX - 13.5} y2={eyeY - 3} />
          <line x1={leftEyeX - 20} y1={eyeY - 4} x2={leftEyeX - 13.5} y2={eyeY - 4} />
          <line x1={rightEyeX + 13.5} y1={eyeY - 4} x2={rightEyeX + 20} y2={eyeY - 4} />
        </g>
      )}
      {glasses.type === 'aviator' && (
        <g stroke={glasses.frameColor} strokeWidth={2.1} fill="rgba(254, 243, 199, 0.22)">
          <path d={`M ${leftEyeX - 14} ${eyeY - 9} L ${leftEyeX + 14} ${eyeY - 9} C ${leftEyeX + 15} ${eyeY + 5}, ${leftEyeX + 8} ${eyeY + 14}, ${leftEyeX - 2} ${eyeY + 13} C ${leftEyeX - 11} ${eyeY + 12}, ${leftEyeX - 15} ${eyeY + 3}, ${leftEyeX - 14} ${eyeY - 9} Z`} />
          <path d={`M ${rightEyeX - 14} ${eyeY - 9} L ${rightEyeX + 14} ${eyeY - 9} C ${rightEyeX + 15} ${eyeY + 3}, ${rightEyeX + 11} ${eyeY + 12}, ${rightEyeX + 2} ${eyeY + 13} C ${rightEyeX - 8} ${eyeY + 14}, ${rightEyeX - 15} ${eyeY + 5}, ${rightEyeX - 14} ${eyeY - 9} Z`} />
          <line x1={leftEyeX + 14} y1={eyeY - 7} x2={rightEyeX - 14} y2={eyeY - 7} />
          <line x1={100 - midEyeDist * 0.22} y1={eyeY - 10} x2={100 + midEyeDist * 0.22} y2={eyeY - 10} strokeWidth={1.5} />
        </g>
      )}
      {glasses.type === 'cateye' && (
        <g stroke={glasses.frameColor} strokeWidth={2.4} fill="rgba(255,255,255,0.15)">
          <path d={`M ${leftEyeX - 16} ${eyeY - 11} L ${leftEyeX + 13} ${eyeY - 7} C ${leftEyeX + 13} ${eyeY + 4}, ${leftEyeX + 7} ${eyeY + 11}, ${leftEyeX - 2} ${eyeY + 11} C ${leftEyeX - 12} ${eyeY + 11}, ${leftEyeX - 15} ${eyeY + 1}, ${leftEyeX - 16} ${eyeY - 11} Z`} />
          <path d={`M ${rightEyeX + 16} ${eyeY - 11} L ${rightEyeX - 13} ${eyeY - 7} C ${rightEyeX - 13} ${eyeY + 4}, ${rightEyeX - 7} ${eyeY + 11}, ${rightEyeX + 2} ${eyeY + 11} C ${rightEyeX + 12} ${eyeY + 11}, ${rightEyeX + 15} ${eyeY + 1}, ${rightEyeX + 16} ${eyeY - 11} Z`} />
          <line x1={leftEyeX + 13} y1={eyeY - 3} x2={rightEyeX - 13} y2={eyeY - 3} />
        </g>
      )}
      {glasses.type === 'half' && (
        <g stroke={glasses.frameColor} strokeWidth={2.2} fill="none">
          <path d={`M ${leftEyeX - 13.5} ${eyeY - 7} L ${leftEyeX + 13} ${eyeY - 7}`} strokeWidth={2.7} strokeLinecap="round" />
          <path d={`M ${rightEyeX - 13} ${eyeY - 7} L ${rightEyeX + 13.5} ${eyeY - 7}`} strokeWidth={2.7} strokeLinecap="round" />
          <path d={`M ${leftEyeX - 12.5} ${eyeY - 7} C ${leftEyeX - 12.5} ${eyeY + 6}, ${leftEyeX - 7} ${eyeY + 10}, ${leftEyeX} ${eyeY + 10} C ${leftEyeX + 7} ${eyeY + 10}, ${leftEyeX + 12} ${eyeY + 6}, ${leftEyeX + 12} ${eyeY - 7}`} strokeWidth={1.2} />
          <path d={`M ${rightEyeX - 12} ${eyeY - 7} C ${rightEyeX - 12} ${eyeY + 6}, ${rightEyeX - 7} ${eyeY + 10}, ${rightEyeX} ${eyeY + 10} C ${rightEyeX + 7} ${eyeY + 10}, ${rightEyeX + 12.5} ${eyeY + 6}, ${rightEyeX + 12.5} ${eyeY - 7}`} strokeWidth={1.2} />
          <line x1={leftEyeX + 13} y1={eyeY - 6} x2={rightEyeX - 13} y2={eyeY - 6} strokeWidth={1.9} />
        </g>
      )}
      {glasses.type === 'sunglasses' && (
        <g stroke={glasses.frameColor} strokeWidth={2.4} fill="#0F172A">
          <rect x={leftEyeX - 14.5} y={eyeY - 10.5} width={28} height={21} rx={6} />
          <rect x={rightEyeX - 13.5} y={eyeY - 10.5} width={28} height={21} rx={6} />
          <line x1={leftEyeX + 13.5} y1={eyeY - 4} x2={rightEyeX - 13.5} y2={eyeY - 4} strokeWidth={2.7} />
          <line x1={leftEyeX - 20} y1={eyeY - 5} x2={leftEyeX - 14.5} y2={eyeY - 5} />
          <line x1={rightEyeX + 14.5} y1={eyeY - 5} x2={rightEyeX + 20} y2={eyeY - 5} />
          <line x1={leftEyeX - 9} y1={eyeY - 7} x2={leftEyeX - 2} y2={eyeY + 6} stroke="rgba(255,255,255,0.28)" strokeWidth={2.2} strokeLinecap="round" />
          <line x1={rightEyeX - 8} y1={eyeY - 7} x2={rightEyeX - 1} y2={eyeY + 6} stroke="rgba(255,255,255,0.28)" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

export const CharacterFaceRenderer: React.FC<CharacterFaceRendererProps> = ({
  character,
  familyMember,
  appearance: propAppearance,
  seed,
  characterId,
  gender: propGender,
  age: propAge,
  ageMonths: propAgeMonths,
  expression: propExpression,
  size = 'md',
  showAgeBadge = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '_');

  const resolvedAge = propAge ?? character?.currentAge ?? familyMember?.age ?? 25;
  const resolvedAgeMonths = Math.max(
    0,
    propAgeMonths ?? (propAge !== undefined ? propAge * 12 : character?.ageMonths ?? familyMember?.ageMonths ?? resolvedAge * 12)
  );

  const resolvedGender: 'Masculino' | 'Feminino' | 'Outro' =
    propGender ??
    character?.gender ??
    (familyMember
      ? familyMember.relation === 'Pai' ||
        familyMember.relation === 'Avô' ||
        familyMember.relation === 'Irmão' ||
        familyMember.relation === 'Filho'
        ? 'Masculino'
        : 'Feminino'
      : 'Masculino');

  const resolvedExpression: FacialExpression = useMemo(() => {
    if (propExpression) return propExpression;
    if (character) return CharacterExpressionEngine.resolveFromCharacter(character);
    if (familyMember && !familyMember.alive) return 'Triste';
    if (familyMember && familyMember.relationship >= 75) return 'Feliz';
    return 'Neutra';
  }, [propExpression, character, familyMember]);

  const resolvedAppearance: CharacterAppearance = useMemo(() => {
    if (propAppearance) return propAppearance;
    if (character) return CharacterVisualEngine.resolveFromCharacter(character);
    if (familyMember) return CharacterVisualEngine.resolveFromFamilyMember(familyMember);
    const fallbackSeed = seed || characterId || 'vidareal_avatar';
    return CharacterVisualEngine.generateFromSeed(fallbackSeed, resolvedGender, characterId);
  }, [propAppearance, character, familyMember, seed, characterId, resolvedGender]);

  const model = useMemo(
    () => CharacterVisualEngine.buildLayeredModelFromMonths(resolvedAppearance, resolvedAgeMonths, resolvedExpression, resolvedGender),
    [resolvedAppearance, resolvedAgeMonths, resolvedExpression, resolvedGender]
  );

  const {
    lifecycle,
    faceShape,
    skinTone,
    hairStyle,
    resolvedHairHex,
    resolvedHairHighlightHex,
    earrings,
    shirtColor,
    backgroundColor,
    expression,
  } = model;

  const p = lifecycle.proportions;
  const skin = lifecycle.skin;
  const hairAging = lifecycle.hair;

  const headGeom = useMemo(() => buildMorphableHeadGeometry(faceShape, p), [faceShape, p]);

  // Subtle extreme longevity skin tone & lip contrast adjustment
  const effectiveSkinBase = useMemo(
    () => (skin.skinDesaturation > 0.02 ? blendHex(skinTone.base, '#E7DDD3', skin.skinDesaturation) : skinTone.base),
    [skinTone.base, skin.skinDesaturation]
  );
  const effectiveLipHex = useMemo(
    () => (skin.lipDesaturation > 0.02 ? blendHex(skinTone.lipBase, '#C4A7A1', skin.lipDesaturation) : skinTone.lipBase),
    [skinTone.lipBase, skin.lipDesaturation]
  );

  const isDeceased = character?.status === 'Morto' || (familyMember ? !familyMember.alive : false);
  const isPrisoner = character?.status === 'Preso';
  const activeShirtColor = isPrisoner ? '#EA580C' : shirtColor;

  // Dynamic coordinate calculations across all 14 continuous proportions
  const leftEyeX = 100 - 19 * p.eyeDistanceScale;
  const rightEyeX = 100 + 19 * p.eyeDistanceScale;
  const eyeY = 97 + p.eyeOffsetY;
  const browY = 84 + p.eyeOffsetY - (p.eyeScale - 1) * 5;
  const noseTopY = 100 + p.eyeOffsetY * 0.92;
  const mouthY = Math.min(headGeom.chinY - 12.5, 131 + p.eyeOffsetY * 0.72 + (p.noseLengthScale - 1) * 4.5);

  const earXLeft = 100 - headGeom.cheekWidth - 1.5;
  const earXRight = 100 + headGeom.cheekWidth + 1.5;
  const earY = 104 + p.eyeOffsetY * 0.55;
  const hairOutline = '#1C1917';

  // Hair transform: gently aligns hairline to skull headScaleX & topY without leaving gaps
  const hairTranslateY = headGeom.topY - 52;
  const hairTransform =
    hairAging.babyHairPhase === 'newborn' || hairAging.babyHairPhase === 'infant'
      ? `translate(100, ${headGeom.topY}) scale(${p.headScaleX * hairAging.babyHairScale}, ${hairAging.babyHairScale}) translate(-100, -52)`
      : `translate(100, 52) scale(${p.headScaleX}, ${p.headScaleY}) translate(-100, ${-52 + hairTranslateY})`;

  const hairOpacity =
    hairAging.babyHairPhase === 'newborn'
      ? 0.58 + hairAging.genetics.infantHairDensity * 0.35
      : Math.max(0.55, 1 - hairAging.thinningFactor * 0.32);

  // Eye clip paths precomputed in top-level defs for cleaner SVG DOM
  const leftEyeRx = model.eyeStyle.rx * p.eyeScale;
  const leftEyeRy = Math.max(2.3, model.eyeStyle.ry * p.eyeScale * expression.eyeScaleY);

  const badgeText =
    resolvedAgeMonths < 12
      ? `${Math.round(resolvedAgeMonths)}m`
      : `${Math.floor(resolvedAgeMonths / 12)}a`;

  const neckHalfWidth = 14 * p.neckWidthScale;
  const neckTopY = Math.max(134, headGeom.chinY - 12);

  return (
    <div
      className={`${SIZE_MAP[size]} rounded-2xl overflow-hidden relative shrink-0 select-none border border-slate-700/70 shadow-md ${
        isDeceased ? 'grayscale opacity-80' : ''
      } ${className}`}
      style={{ backgroundColor }}
      data-character-id={resolvedAppearance.characterId}
      data-age-stage={lifecycle.stage}
      data-age-months={Math.round(resolvedAgeMonths)}
      data-visual-version={model.visualVersion}
      data-expression={expression.expression}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full block"
        role="img"
        aria-label={`Retrato 2D (${lifecycle.stageDef.label}, ${AdvancedLifecycleVisualEngine.formatAgeDisplay(resolvedAgeMonths)}, expressão ${expression.expression})`}
      >
        <defs>
          <radialGradient id={`bg_${uid}`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor={backgroundColor} stopOpacity="0" />
          </radialGradient>
          <clipPath id={`eyeL_${uid}`}>
            <ellipse cx={leftEyeX} cy={eyeY} rx={leftEyeRx} ry={leftEyeRy} />
          </clipPath>
          <clipPath id={`eyeR_${uid}`}>
            <ellipse cx={rightEyeX} cy={eyeY} rx={leftEyeRx} ry={leftEyeRy} />
          </clipPath>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="200" height="200" fill={backgroundColor} />
        <rect x="0" y="0" width="200" height="200" fill={`url(#bg_${uid})`} />

        {/* Layer 3 (behind neck/head): Back Hair */}
        {hairStyle.backPath && (
          <g data-layer="backHair" transform={hairTransform} opacity={hairOpacity}>
            <path
              d={hairStyle.backPath}
              fill={resolvedHairHex}
              stroke={hairOutline}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Layer 1a: Shoulders & Neck */}
        <g data-layer="shoulders">
          <path
            d={`M ${38 + (1 - p.neckWidthScale) * 8} 206 C ${42 + (1 - p.neckWidthScale) * 8} 172, 66 161, 86 160 L 114 160 C 134 161, ${158 - (1 - p.neckWidthScale) * 8} 172, ${162 - (1 - p.neckWidthScale) * 8} 206 Z`}
            fill={activeShirtColor}
            stroke={skinTone.outline}
            strokeWidth={2.3}
            strokeLinejoin="round"
          />
          {isPrisoner && (
            <path
              d="M 55 182 L 145 182 M 46 194 L 154 194"
              stroke="#1E293B"
              strokeWidth={3.5}
              opacity={0.45}
            />
          )}
          <path
            d="M 82 160 Q 100 174 118 160"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.0}
            opacity={0.45}
          />
          <path
            d={`M ${100 - neckHalfWidth} ${neckTopY} L ${100 - neckHalfWidth} 162 Q 100 170 ${100 + neckHalfWidth} 162 L ${100 + neckHalfWidth} ${neckTopY} Z`}
            fill={effectiveSkinBase}
            stroke={skinTone.outline}
            strokeWidth={2.1}
            strokeLinejoin="round"
          />
          {p.showNeck && (
            <path
              d={`M ${100 - neckHalfWidth + 1} ${headGeom.chinY - 6} Q 100 ${headGeom.chinY + 5} ${100 + neckHalfWidth - 1} ${headGeom.chinY - 6} L ${100 + neckHalfWidth - 1} ${headGeom.chinY + 2} Q 100 ${headGeom.chinY + 9} ${100 - neckHalfWidth + 1} ${headGeom.chinY + 2} Z`}
              fill={skinTone.shadow}
              opacity={0.6}
            />
          )}
        </g>

        {/* Layer 2: Ears */}
        <g data-layer="ears">
          {renderEar(earXLeft, earY, p.earScale, false, effectiveSkinBase, skinTone.shadow, skinTone.outline, earrings.type)}
          {renderEar(earXRight, earY, p.earScale, true, effectiveSkinBase, skinTone.shadow, skinTone.outline, earrings.type)}
        </g>

        {/* Layer 1b: Morphable Base Head */}
        <g data-layer="baseHead">
          <path
            d={headGeom.path}
            fill={effectiveSkinBase}
            stroke={skinTone.outline}
            strokeWidth={2.35}
            strokeLinejoin="round"
          />
          {/* Forehead highlight */}
          <ellipse cx={100} cy={headGeom.topY + 18} rx={21 * p.headScaleX} ry={8} fill={skinTone.highlight} opacity={0.32} />

          {/* Cheek volume / blush */}
          <ellipse
            cx={100 - headGeom.cheekWidth * 0.62}
            cy={eyeY + 18}
            rx={8.5 + Math.max(0, p.cheekVolume) * 2.5}
            ry={4.8 + Math.max(0, p.cheekVolume) * 1.4}
            fill={skinTone.blush}
            opacity={0.22 + (expression.blushBoost || 0) + skin.babyBlushOpacity}
          />
          <ellipse
            cx={100 + headGeom.cheekWidth * 0.62}
            cy={eyeY + 18}
            rx={8.5 + Math.max(0, p.cheekVolume) * 2.5}
            ry={4.8 + Math.max(0, p.cheekVolume) * 1.4}
            fill={skinTone.blush}
            opacity={0.22 + (expression.blushBoost || 0) + skin.babyBlushOpacity}
          />

          {/* Subtle cheekbone / gaunt hollow shading in advanced ages */}
          {p.cheekVolume < -0.18 && (
            <g fill={skinTone.shadow} opacity={Math.min(0.32, (-p.cheekVolume - 0.18) * 0.6)}>
              <ellipse cx={100 - headGeom.cheekWidth * 0.68} cy={mouthY - 6} rx={5.5} ry={9.5} transform={`rotate(-12 ${100 - headGeom.cheekWidth * 0.68} ${mouthY - 6})`} />
              <ellipse cx={100 + headGeom.cheekWidth * 0.68} cy={mouthY - 6} rx={5.5} ry={9.5} transform={`rotate(12 ${100 + headGeom.cheekWidth * 0.68} ${mouthY - 6})`} />
            </g>
          )}
        </g>

        {/* Layer 4: Eyebrows */}
        <g data-layer="eyebrows">
          {renderEyebrow(leftEyeX, browY, false, model)}
          {renderEyebrow(rightEyeX, browY, true, model)}
        </g>

        {/* Layer 5: Eyes */}
        <g data-layer="eyes">
          {renderEye(leftEyeX, eyeY, false, model, effectiveSkinBase, `eyeL_${uid}`)}
          {renderEye(rightEyeX, eyeY, true, model, effectiveSkinBase, `eyeR_${uid}`)}
        </g>

        {/* Layer 6: Nose */}
        <g data-layer="nose">{renderNose(noseTopY, model)}</g>

        {/* Layer 7: Mouth */}
        <g data-layer="mouth">{renderMouth(mouthY, model, effectiveLipHex)}</g>

        {/* Layer 8: Beard & Mustache (only 16+) */}
        <g data-layer="facialHair">{renderFacialHair(mouthY, headGeom.chinY, model, effectiveSkinBase)}</g>

        {/* Layer 9: Front Hair */}
        {hairStyle.frontPath && (
          <g data-layer="frontHair" transform={hairTransform} opacity={hairOpacity}>
            <path
              d={hairStyle.frontPath}
              fill={resolvedHairHex}
              stroke={hairOutline}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            {hairStyle.accentPaths?.map((ap, i) => (
              <path
                key={i}
                d={ap}
                fill="none"
                stroke={resolvedHairHighlightHex}
                strokeWidth={2.0}
                strokeLinecap="round"
                opacity={0.55}
              />
            ))}
            {/* Thinning scalp parting sheen on older characters */}
            {hairAging.thinningFactor > 0.35 && hairStyle.category !== 'careca' && (
              <path
                d="M 96 44 Q 100 52 104 44"
                fill={effectiveSkinBase}
                opacity={Math.min(0.55, hairAging.thinningFactor * 0.65)}
              />
            )}
          </g>
        )}

        {/* Layer 10: Accessories, Freckles, Wrinkles, Age Spots & Facial Marks */}
        <g data-layer="accessories">
          {renderSkinAndAccessories(model, {
            leftEyeX,
            rightEyeX,
            eyeY,
            noseTopY,
            mouthY,
            headTopY: headGeom.topY,
            cheekWidth: headGeom.cheekWidth,
          })}
        </g>
      </svg>

      {showAgeBadge && (
        <div className="absolute bottom-1 right-1 bg-slate-950/90 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/40 pointer-events-none tabular-nums">
          {badgeText}
        </div>
      )}
    </div>
  );
};
