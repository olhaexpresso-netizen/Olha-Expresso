import React, { useState } from 'react';
import { Character, CharacterAppearance } from '../../types';
import { WorldState } from '../../types/world';
import { CharacterAvatar } from '../CharacterAvatar';
import { CharacterAppearanceEditor } from '../CharacterAppearanceEditor';
import { CharacterVisualEngine } from '../../services/CharacterVisualEngine';
import { CharacterAging2D } from '../../services/CharacterAging2D';
import { CharacterExpressionEngine } from '../../services/CharacterExpressionEngine';
import { BrazilHistoricalSimulationEngine } from '../../services/BrazilHistoricalSimulationEngine';
import { RELIGIONS_CATALOG } from '../../services/CivilizationSystemsEngine';
import {
  Heart,
  Smile,
  Brain,
  Sparkles,
  Activity,
  Award,
  Shield,
  Briefcase,
  GraduationCap,
  Palette,
  X,
  Home,
  Compass,
  HeartHandshake,
} from 'lucide-react';

interface ProfileTabProps {
  character: Character;
  worldState?: WorldState;
  onUpdateAppearance?: (appearance: CharacterAppearance) => Promise<void> | void;
  onPracticeMentalWellness?: (activity: 'therapy' | 'sport' | 'meditation') => Promise<void> | void;
  onUpdateReligion?: (religion: string) => Promise<void> | void;
  onRetire?: () => Promise<void> | void;
  onTriggerCatalogEvent?: () => Promise<void> | void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  character,
  worldState,
  onUpdateAppearance,
  onPracticeMentalWellness,
  onUpdateReligion,
  onRetire,
  onTriggerCatalogEvent,
}) => {
  const [editingAppearance, setEditingAppearance] = useState(false);
  const [draftAppearance, setDraftAppearance] = useState<CharacterAppearance>(() =>
    CharacterVisualEngine.resolveFromCharacter(character)
  );
  const [saving, setSaving] = useState(false);

  const formattedSalary = BrazilHistoricalSimulationEngine.formatMoney(
    character.salary,
    worldState?.brazil.currency
  );
  const ageMonths = character.ageMonths ?? character.currentAge * 12;
  const ageStageLabel = CharacterAging2D.getStageLabel(CharacterAging2D.resolveStageFromMonths(ageMonths));
  const currentExpression = CharacterExpressionEngine.resolveFromCharacter(character);
  const mentalHealth = character.mentalHealth ?? 75;
  const inssYears = character.inssContributionYears ?? 0;
  const canRetire =
    character.status === 'Vivo' &&
    !character.isRetired &&
    (character.currentAge >= 60 || inssYears >= 30);

  const handleOpenEditor = () => {
    setDraftAppearance(CharacterVisualEngine.resolveFromCharacter(character));
    setEditingAppearance(true);
  };

  const handleSaveAppearance = async () => {
    if (!onUpdateAppearance) {
      setEditingAppearance(false);
      return;
    }
    try {
      setSaving(true);
      await onUpdateAppearance(draftAppearance);
      setEditingAppearance(false);
    } finally {
      setSaving(false);
    }
  };

  const StatBar = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="text-xs font-bold text-white tabular-nums">{value}%</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <CharacterAvatar character={character} ageMonths={ageMonths} size="xl" showAgeBadge={true} />
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{character.firstName} {character.lastName}</h2>
              <p className="text-sm text-slate-400 tabular-nums">
                {character.currentAge} anos ({ageStageLabel}) · Nascido(a) em {character.birthYear} · {character.city}, {character.state}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 shrink-0">
              {onTriggerCatalogEvent && character.status !== 'Morto' && (
                <button
                  type="button"
                  onClick={onTriggerCatalogEvent}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
                >
                  <Sparkles size={14} /> Sortear Evento de Vida
                </button>
              )}
              {onUpdateAppearance && character.status === 'Vivo' && (
                <button
                  type="button"
                  onClick={handleOpenEditor}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap shrink-0"
                >
                  <Palette size={15} className="text-emerald-400" /> Personalizar Aparência
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <GraduationCap size={14} className="text-sky-400" /> {character.educationLevel}
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Briefcase size={14} className="text-emerald-400" /> {character.careerTitle || 'Desempregado(a)'} ({formattedSalary}/ano)
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400">
              Expressão atual: <strong className="text-slate-200">{currentExpression}</strong>
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Atributos Pessoais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatBar label="Saúde" value={character.health} icon={<Heart size={16} className="text-rose-500" />} color="bg-rose-500" />
          <StatBar label="Saúde Mental" value={mentalHealth} icon={<HeartHandshake size={16} className="text-cyan-400" />} color="bg-cyan-400" />
          <StatBar label="Felicidade" value={character.happiness} icon={<Smile size={16} className="text-amber-400" />} color="bg-amber-400" />
          <StatBar label="Inteligência" value={character.intelligence} icon={<Brain size={16} className="text-sky-400" />} color="bg-sky-400" />
          <StatBar label="Aparência" value={character.looks} icon={<Sparkles size={16} className="text-purple-400" />} color="bg-purple-400" />
          <StatBar label="Condicionamento Físico" value={character.fitness} icon={<Activity size={16} className="text-emerald-400" />} color="bg-emerald-400" />
          <StatBar label="Carisma" value={character.charisma} icon={<Award size={16} className="text-teal-400" />} color="bg-teal-400" />
          <StatBar label="Disciplina" value={character.discipline} icon={<Shield size={16} className="text-blue-400" />} color="bg-blue-400" />
          <StatBar label="Reputação" value={character.reputation} icon={<Award size={16} className="text-indigo-400" />} color="bg-indigo-400" />
        </div>
      </div>

      {/* Mental Health, Housing, INSS & Culture Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <HeartHandshake size={16} className="text-cyan-400" /> Bem-Estar Mental & Hábitos
          </h3>
          <p className="text-xs text-slate-400">
            Cuidar da saúde mental reduz estresse, previne crises emocionais e melhora a estabilidade no trabalho e na família.
          </p>
          {onPracticeMentalWellness && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={character.status === 'Morto'}
                onClick={() => onPracticeMentalWellness('therapy')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap"
              >
                Sessão de Terapia
              </button>
              <button
                type="button"
                disabled={character.status === 'Morto'}
                onClick={() => onPracticeMentalWellness('sport')}
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap"
              >
                Prática Esportiva
              </button>
              <button
                type="button"
                disabled={character.status === 'Morto'}
                onClick={() => onPracticeMentalWellness('meditation')}
                className="bg-sky-700 hover:bg-sky-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap"
              >
                Meditação & Descanso
              </button>
            </div>
          )}

          {character.hobbies && character.hobbies.length > 0 && (
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400">Interesses & Hobbies: </span>
              {character.hobbies.join(' · ')}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Home size={16} className="text-emerald-400" /> Moradia, Previdência & Convicções
          </h3>
          <div className="space-y-2 text-xs text-slate-300 tabular-nums">
            <div className="flex justify-between">
              <span className="text-slate-400">Situação Habitacional:</span>
              <span className="font-semibold text-white">{character.housingStatus || 'Mora com pais'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Contribuição INSS:</span>
              <span className="font-semibold text-white">{inssYears} ano(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Previdência:</span>
              <span className="font-semibold text-emerald-400">
                {character.isRetired
                  ? `Aposentado(a) · ${BrazilHistoricalSimulationEngine.formatMoney(character.pensionCentavos || 0, worldState?.brazil.currency)}/ano`
                  : 'Em atividade / Acumulando tempo'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Compass size={13} /> Passaportes / Cidadania:
              </span>
              <span className="text-white font-medium">{(character.passportCountries || ['Brasil']).join(', ')}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {onUpdateReligion && (
              <select
                aria-label="Religião ou convicção"
                value={character.religion || 'Sem Religião / Secular'}
                onChange={(e) => onUpdateReligion(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {RELIGIONS_CATALOG.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            )}
            {onRetire && !character.isRetired && (
              <button
                type="button"
                disabled={!canRetire}
                onClick={onRetire}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  canRetire
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {canRetire ? 'Solicitar Aposentadoria' : 'INSS (60a ou 30a contrib.)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {editingAppearance && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="edit-app-title">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-white max-h-[92vh] flex flex-col">
            <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 id="edit-app-title" className="text-base font-bold flex items-center gap-2">
                  <Palette size={18} className="text-emerald-400" /> Editor de Aparência — {character.firstName}
                </h3>
                <p className="text-xs text-slate-400">Personalize rosto, pele, olhos, sobrancelhas, cabelo, barba e acessórios</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAppearance(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                aria-label="Fechar editor"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <CharacterAppearanceEditor
                appearance={draftAppearance}
                gender={character.gender}
                age={character.currentAge}
                onChange={setDraftAppearance}
                onSave={saving ? undefined : handleSaveAppearance}
                onCancel={() => setEditingAppearance(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

