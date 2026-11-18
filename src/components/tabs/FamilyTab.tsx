import React, { useState } from 'react';
import { Character, FamilyMember } from '../../types';
import { CharacterAvatar } from '../CharacterAvatar';
import { CharacterVisualEngine } from '../../services/CharacterVisualEngine';
import { Users, Heart, Briefcase, HeartHandshake, Baby, Sparkles, UserPlus, HeartCrack, Handshake } from 'lucide-react';

interface FamilyTabProps {
  character: Character;
  family: FamilyMember[];
  confirmRiskyActions?: boolean;
  onMarry?: () => void;
  onDivorce?: () => void;
  onHaveChild?: () => void;
  onAdoptChild?: () => void;
  onInteractMember?: (memberId: string, action: 'conversar' | 'elogiar' | 'ajudar' | 'discutir') => void;
  onReconcileMember?: (memberId: string) => void;
  familyFeedback?: string | null;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({
  character,
  family,
  confirmRiskyActions = true,
  onMarry,
  onDivorce,
  onHaveChild,
  onAdoptChild,
  onInteractMember,
  onReconcileMember,
  familyFeedback,
}) => {
  const [confirmingDivorce, setConfirmingDivorce] = useState(false);

  const hasLivingSpouse = family.some((f) => f.relation === 'Cônjuge' && f.alive);
  const canMarry = character.status === 'Vivo' && character.currentAge >= 18 && !hasLivingSpouse;
  const canHaveChild = character.status === 'Vivo' && character.currentAge >= 18 && character.currentAge <= 55;
  const canAdopt = character.status === 'Vivo' && character.currentAge >= 21;

  const handleDivorceClick = () => {
    if (!onDivorce) return;
    if (confirmRiskyActions && !confirmingDivorce) {
      setConfirmingDivorce(true);
      return;
    }
    setConfirmingDivorce(false);
    onDivorce();
  };

  return (
    <div className="space-y-6">
      {familyFeedback && (
        <div className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 rounded-xl px-4 py-3 text-sm">
          {familyFeedback}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users size={20} className="text-emerald-400" /> Núcleo Familiar ({family.length})
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {onMarry && !hasLivingSpouse && (
            <button
              disabled={!canMarry}
              onClick={onMarry}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                canMarry
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <HeartHandshake size={14} /> Casar
            </button>
          )}
          {onDivorce && hasLivingSpouse && (
            <div className="flex items-center gap-1.5">
              {confirmingDivorce ? (
                <>
                  <button
                    onClick={() => setConfirmingDivorce(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDivorceClick}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow"
                  >
                    Confirmar Divórcio
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDivorceClick}
                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/70 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <HeartCrack size={14} /> Divorciar
                </button>
              )}
            </div>
          )}
          {onHaveChild && (
            <button
              disabled={!canHaveChild}
              onClick={onHaveChild}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                canHaveChild
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Baby size={14} /> Ter Filho(a)
            </button>
          )}
          {onAdoptChild && (
            <button
              disabled={!canAdopt}
              onClick={onAdoptChild}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                canAdopt
                  ? 'bg-teal-700 hover:bg-teal-600 text-white shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <UserPlus size={14} /> Adotar
            </button>
          )}
        </div>
      </div>

      {family.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          Nenhum familiar registrado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {family.map((member) => {
            const memberAppearance = CharacterVisualEngine.resolveFromFamilyMember(member, character);
            const memberGender: 'Masculino' | 'Feminino' =
              member.gender === 'Masculino' ||
              member.relation === 'Pai' ||
              member.relation === 'Avô' ||
              member.relation === 'Irmão' ||
              member.relation === 'Filho' ||
              member.relation === 'Neto' ||
              member.relation === 'Bisneto' ||
              member.relation === 'Tio'
                ? 'Masculino'
                : member.relation === 'Cônjuge' && character?.gender === 'Feminino'
                  ? 'Masculino'
                  : 'Feminino';

            return (
              <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <CharacterAvatar
                      familyMember={member}
                      appearance={memberAppearance}
                      gender={memberGender}
                      age={member.age}
                      ageMonths={member.ageMonths ?? member.age * 12}
                      size="md"
                      showAgeBadge={true}
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base truncate">{member.name}</span>
                        <span className="text-xs text-emerald-400 font-medium">
                          · {member.relation}
                          {member.isAdopted ? ' (Adotivo)' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 tabular-nums">
                        {member.age} anos · {member.alive ? `Vivo(a)${member.mood ? ` · ${member.mood}` : ''}` : `Falecido(a)${member.deathYear ? ` em ${member.deathYear}` : ''}`}
                      </p>
                      {member.occupation && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                          <Briefcase size={12} className="shrink-0" /> {member.occupation}
                        </p>
                      )}
                      {member.personality && member.personality.length > 0 && (
                        <p className="text-[11px] text-slate-500 truncate">
                          Traços: {member.personality.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 tabular-nums">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Heart size={14} className="text-rose-500" /> Afetividade
                    </span>
                    <span className="text-sm font-bold text-white">{member.relationship}%</span>
                  </div>
                </div>

                {member.episodicMemories && member.episodicMemories.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                    {member.episodicMemories.slice(-2).reverse().map((mem) => (
                      <div key={mem.id} className="truncate tabular-nums">
                        {mem.year} · {mem.summary}
                      </div>
                    ))}
                  </div>
                )}

                {member.alive && character.status === 'Vivo' && (onInteractMember || onReconcileMember) && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                    {onInteractMember && (
                      <>
                        <button
                          type="button"
                          onClick={() => onInteractMember(member.id, 'conversar')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                        >
                          <Sparkles size={11} /> Conversar
                        </button>
                        <button
                          type="button"
                          onClick={() => onInteractMember(member.id, 'elogiar')}
                          className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition"
                        >
                          Elogiar
                        </button>
                        <button
                          type="button"
                          onClick={() => onInteractMember(member.id, 'ajudar')}
                          className="bg-sky-900/60 hover:bg-sky-800 text-sky-200 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition"
                        >
                          Ajudar
                        </button>
                        <button
                          type="button"
                          onClick={() => onInteractMember(member.id, 'discutir')}
                          className="bg-rose-950/70 hover:bg-rose-900 text-rose-200 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition"
                        >
                          Discutir
                        </button>
                      </>
                    )}
                    {onReconcileMember && member.relationship < 60 && (
                      <button
                        type="button"
                        onClick={() => onReconcileMember(member.id)}
                        className="bg-amber-900/50 hover:bg-amber-800 text-amber-200 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ml-auto"
                      >
                        <Handshake size={11} /> Reconciliar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

