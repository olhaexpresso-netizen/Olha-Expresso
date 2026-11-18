import React, { useState } from 'react';
import { Character, FamilyMember } from '../../types';
import { FamilyGenerationRecord, WorldState } from '../../types/world';
import { CharacterAvatar } from '../CharacterAvatar';
import { CharacterVisualEngine } from '../../services/CharacterVisualEngine';
import { BrazilHistoricalSimulationEngine } from '../../services/BrazilHistoricalSimulationEngine';
import { Users, Crown } from 'lucide-react';

interface FamilyTreeTabProps {
  character: Character;
  family: FamilyMember[];
  worldState?: WorldState;
  generationsHistory?: FamilyGenerationRecord[];
  onContinueAsHeir?: (heirId: string) => void;
}

export const FamilyTreeTab: React.FC<FamilyTreeTabProps> = ({
  character,
  family,
  worldState,
  generationsHistory = [],
  onContinueAsHeir,
}) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const grandparents = family.filter((f) => f.relation === 'Avô' || f.relation === 'Avó');
  const parents = family.filter((f) => f.relation === 'Pai' || f.relation === 'Mãe');
  const extended = family.filter(
    (f) => f.relation === 'Tio' || f.relation === 'Tia' || f.relation === 'Primo' || f.relation === 'Prima'
  );
  const siblings = family.filter((f) => f.relation === 'Irmão' || f.relation === 'Irmã');
  const children = family.filter(
    (f) => f.relation === 'Filho' || f.relation === 'Filha' || f.relation === 'Enteado' || f.relation === 'Enteada'
  );
  const grandchildren = family.filter((f) => f.relation === 'Neto' || f.relation === 'Neta');
  const greatGrandchildren = family.filter((f) => f.relation === 'Bisneto' || f.relation === 'Bisneta');
  const spouse = family.find((f) => f.relation === 'Cônjuge');
  const exSpouses = family.filter((f) => f.relation === 'Ex-Cônjuge');

  const resolveMemberGender = (m: FamilyMember): 'Masculino' | 'Feminino' => {
    if (
      m.gender === 'Masculino' ||
      m.relation === 'Pai' ||
      m.relation === 'Avô' ||
      m.relation === 'Irmão' ||
      m.relation === 'Filho' ||
      m.relation === 'Neto' ||
      m.relation === 'Bisneto' ||
      m.relation === 'Tio'
    ) {
      return 'Masculino';
    }
    if (m.relation === 'Cônjuge' && character.gender === 'Feminino') {
      return 'Masculino';
    }
    return 'Feminino';
  };

  const renderMemberCard = (member: FamilyMember, allowHeir = false) => (
    <div
      key={member.id}
      onClick={() => setSelectedMember(member)}
      className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        <CharacterAvatar
          familyMember={member}
          appearance={CharacterVisualEngine.resolveFromFamilyMember(member, character)}
          gender={resolveMemberGender(member)}
          age={member.age}
          ageMonths={member.ageMonths ?? member.age * 12}
          size="sm"
        />
        <div className="min-w-0">
          <h4 className="font-bold text-white text-xs truncate">{member.name}</h4>
          <p className="text-[11px] text-slate-400 tabular-nums">
            {member.relation} · {member.age} anos · {member.alive ? 'Vivo(a)' : 'Falecido(a)'}
          </p>
        </div>
      </div>
      {allowHeir && character.status === 'Morto' && member.alive && onContinueAsHeir && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContinueAsHeir(member.id);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0"
        >
          Jogar com Herdeiro
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users size={20} className="text-emerald-400" /> Árvore Genealógica & Linhagem
        </h2>
        <span className="text-xs text-slate-300 font-medium tabular-nums">
          Geração {character.generation}
        </span>
      </div>

      {generationsHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Crown size={14} /> Gerações Anteriores da Dinastia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs tabular-nums">
            {generationsHistory.map((gen) => (
              <div key={gen.protagonistId} className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5">
                <div className="font-bold text-white">
                  {gen.generation}ª Geração · {gen.protagonistName}
                </div>
                <div className="text-slate-400 mt-0.5">
                  {gen.birthYear}–{gen.deathYear || '?'} · {gen.city} · {gen.legacyTitle}
                </div>
                <div className="text-emerald-400 mt-1">
                  Patrimônio legado: {BrazilHistoricalSimulationEngine.formatMoney(gen.inheritedNetWorthCentavos, worldState?.brazil.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
        {grandparents.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Avós</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {grandparents.map((gp) => renderMemberCard(gp))}
            </div>
          </div>
        )}

        {parents.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Pais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parents.map((p) => renderMemberCard(p))}
            </div>
          </div>
        )}

        {extended.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Tios & Primos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {extended.map((m) => renderMemberCard(m))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Você & Cônjuge</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-950/30 border border-emerald-600/40 p-4 rounded-xl flex items-center gap-4 shadow-lg">
              <CharacterAvatar character={character} size="lg" />
              <div className="min-w-0">
                <h4 className="font-bold text-white text-base truncate">{character.firstName} {character.lastName} (Você)</h4>
                <p className="text-xs text-slate-300 tabular-nums">{character.currentAge} anos · {character.careerTitle || 'Sem profissão'}</p>
                <p className="text-xs text-emerald-400 mt-1 tabular-nums">Geração {character.generation}</p>
              </div>
            </div>

            {spouse && renderMemberCard(spouse)}
          </div>
          {exSpouses.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exSpouses.map((ex) => renderMemberCard(ex))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Irmãos ({siblings.length})</h3>
            {siblings.length === 0 ? (
              <p className="text-xs text-slate-500">Filho(a) único(a).</p>
            ) : (
              <div className="space-y-3">{siblings.map((sib) => renderMemberCard(sib))}</div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Filhos & Enteados ({children.length})</h3>
            {children.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum filho registrado ainda.</p>
            ) : (
              <div className="space-y-3">{children.map((child) => renderMemberCard(child, true))}</div>
            )}
          </div>
        </div>

        {grandchildren.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Netos ({grandchildren.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grandchildren.map((gc) => renderMemberCard(gc, true))}
            </div>
          </div>
        )}

        {greatGrandchildren.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Bisnetos ({greatGrandchildren.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {greatGrandchildren.map((bgc) => renderMemberCard(bgc, true))}
            </div>
          </div>
        )}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <CharacterAvatar
                familyMember={selectedMember}
                appearance={CharacterVisualEngine.resolveFromFamilyMember(selectedMember, character)}
                gender={resolveMemberGender(selectedMember)}
                age={selectedMember.age}
                ageMonths={selectedMember.ageMonths ?? selectedMember.age * 12}
                size="lg"
              />
              <div>
                <h3 className="text-lg font-bold">{selectedMember.name}</h3>
                <p className="text-xs text-slate-400 tabular-nums">{selectedMember.relation} · {selectedMember.age} anos</p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-800 text-sm">
              <p className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-emerald-400">{selectedMember.alive ? 'Vivo(a)' : 'Falecido(a)'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Afinidade:</span>
                <span className="font-semibold text-white tabular-nums">{selectedMember.relationship}%</span>
              </p>
              {selectedMember.occupation && (
                <p className="flex justify-between">
                  <span className="text-slate-400">Ocupação:</span>
                  <span className="font-semibold text-white">{selectedMember.occupation}</span>
                </p>
              )}
              {selectedMember.memories && selectedMember.memories.length > 0 && (
                <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                  <span className="text-slate-400 block mb-1">Memórias:</span>
                  {selectedMember.memories.slice(-3).map((m, idx) => (
                    <div key={idx}>• {m}</div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
