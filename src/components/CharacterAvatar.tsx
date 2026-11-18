import React from 'react';
import { Character, CharacterAppearance, FacialExpression, FamilyMember } from '../types';
import { CharacterFaceRenderer } from './CharacterFaceRenderer';

interface CharacterAvatarProps {
  character?: Character;
  familyMember?: FamilyMember;
  appearance?: CharacterAppearance;
  seed?: string;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
  age?: number;
  ageMonths?: number;
  characterId?: string;
  expression?: FacialExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showAgeBadge?: boolean;
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  familyMember,
  appearance,
  seed,
  gender = 'Masculino',
  age,
  ageMonths,
  characterId = 'default',
  expression,
  size = 'md',
  showAgeBadge = true,
  className = '',
}) => {
  return (
    <CharacterFaceRenderer
      character={character}
      familyMember={familyMember}
      appearance={appearance}
      seed={seed}
      characterId={characterId}
      gender={gender}
      age={age}
      ageMonths={ageMonths}
      expression={expression}
      size={size}
      showAgeBadge={showAgeBadge}
      className={className}
    />
  );
};
