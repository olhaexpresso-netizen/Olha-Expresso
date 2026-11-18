import React, { useState } from 'react';
import { CharacterAppearance, FacialExpression } from '../types';
import { CharacterFaceRenderer } from './CharacterFaceRenderer';
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
} from '../services/CharacterFaceLibrary';
import { HAIR_COLORS, HAIR_STYLES } from '../services/CharacterHairLibrary';
import { ALL_EXPRESSIONS } from '../services/CharacterExpressionEngine';
import { CharacterVisualEngine } from '../services/CharacterVisualEngine';
import { AdvancedLifecycleVisualEngine } from '../services/AdvancedLifecycleVisualEngine';
import { Dices, Check, Columns } from 'lucide-react';

export type EditorTab = 'Rosto' | 'Pele' | 'Olhos' | 'Sobrancelhas' | 'Cabelo' | 'Barba' | 'Acessórios';

const TABS: EditorTab[] = ['Rosto', 'Pele', 'Olhos', 'Sobrancelhas', 'Cabelo', 'Barba', 'Acessórios'];

const AGE_PRESETS = [
  { label: '0m', months: 0 },
  { label: '6m', months: 6 },
  { label: '4a', months: 48 },
  { label: '15a', months: 180 },
  { label: '25a', months: 300 },
  { label: '55a', months: 660 },
  { label: '75a', months: 900 },
  { label: '95a', months: 1140 },
  { label: '105a', months: 1260 },
];

const COMPARE_MILESTONES = [
  { label: '0m', months: 0 },
  { label: '6m', months: 6 },
  { label: '5a', months: 60 },
  { label: '15a', months: 180 },
  { label: '25a', months: 300 },
  { label: '55a', months: 660 },
  { label: '85a', months: 1020 },
  { label: '105a', months: 1260 },
];

interface CharacterAppearanceEditorProps {
  appearance: CharacterAppearance;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  age: number;
  onChange: (updated: CharacterAppearance) => void;
  onSave?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export const CharacterAppearanceEditor: React.FC<CharacterAppearanceEditorProps> = ({
  appearance,
  gender,
  age,
  onChange,
  onSave,
  onCancel,
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('Rosto');
  const [previewExpression, setPreviewExpression] = useState<FacialExpression>('Feliz');
  const [previewMonths, setPreviewMonths] = useState<number>(age < 2 ? 264 : age * 12);
  const [useCustomPreviewAge, setUseCustomPreviewAge] = useState<boolean>(age < 2);
  const [showCompareStages, setShowCompareStages] = useState<boolean>(false);

  const displayMonths = useCustomPreviewAge ? previewMonths : age * 12;
  const displayYears = Math.round(displayMonths / 12);
  const displayStage = AdvancedLifecycleVisualEngine.resolveAgeStage(displayMonths);
  const displayStageLabel = AdvancedLifecycleVisualEngine.getStageLabel(displayStage);

  const update = (patch: Partial<CharacterAppearance>) => {
    onChange({ ...appearance, ...patch });
  };

  const updateAccessory = (patch: Partial<CharacterAppearance['accessories']>) => {
    onChange({
      ...appearance,
      accessories: { ...appearance.accessories, ...patch },
    });
  };

  const handleRandomizeAppearance = () => {
    const randomSeed = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const next = CharacterVisualEngine.generateFromSeed(randomSeed, gender, appearance.characterId);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className={`flex flex-col ${compact ? 'gap-4' : 'lg:flex-row gap-6'} text-white`}>
        {/* Left Preview Column */}
        <div className={`flex flex-col items-center gap-3 ${compact ? 'w-full' : 'lg:w-72 shrink-0'} bg-slate-950/60 border border-slate-800 rounded-2xl p-4`}>
          <CharacterFaceRenderer
            appearance={appearance}
            gender={gender}
            ageMonths={displayMonths}
            expression={previewExpression}
            size="xl"
            showAgeBadge={true}
          />

          <div className="text-center">
            <span className="text-xs font-semibold text-emerald-400">{displayStageLabel}</span>
            <span className="text-[11px] text-slate-400 block tabular-nums">
              {AdvancedLifecycleVisualEngine.formatAgeDisplay(displayMonths)} ({Math.round(displayMonths)} meses)
            </span>
          </div>

          <div className="w-full space-y-2.5 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expressão de Prévia</label>
              <select
                value={previewExpression}
                onChange={e => setPreviewExpression(e.target.value as FacialExpression)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {ALL_EXPRESSIONS.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Prévia de Idade (0–120a)</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {displayMonths < 12 ? `${displayMonths} meses` : `${displayYears} anos`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                value={displayYears}
                onChange={e => {
                  setUseCustomPreviewAge(true);
                  setPreviewMonths(Number(e.target.value) * 12);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {AGE_PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setUseCustomPreviewAge(true);
                      setPreviewMonths(p.months);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition tabular-nums ${
                      displayMonths === p.months
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {age < 2 && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Personagem inicia recém-nascido (0m); prévia permite inspecionar traços em toda a vida.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRandomizeAppearance}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Dices size={14} /> Sortear
              </button>
              <button
                type="button"
                onClick={() => setShowCompareStages(v => !v)}
                className={`flex-1 border py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  showCompareStages
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <Columns size={14} /> Fases
              </button>
            </div>
          </div>
        </div>

      {/* Right Tabs & Options */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
        <div className="space-y-4">
          {/* 7 Required Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 max-h-80 overflow-y-auto space-y-4">
            {activeTab === 'Rosto' && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Formato do Rosto ({FACE_SHAPES.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FACE_SHAPES.map(fs => (
                      <button
                        key={fs.id}
                        type="button"
                        onClick={() => update({ faceShape: fs.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          appearance.faceShape === fs.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {fs.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Nariz</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {NOSE_STYLES.map(ns => (
                      <button
                        key={ns.id}
                        type="button"
                        onClick={() => update({ noseStyle: ns.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          appearance.noseStyle === ns.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {ns.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Boca e Lábios</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MOUTH_STYLES.map(ms => (
                      <button
                        key={ms.id}
                        type="button"
                        onClick={() => update({ mouthStyle: ms.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          appearance.mouthStyle === ms.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {ms.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Pele' && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Tom de Pele</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {SKIN_TONES.map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => update({ skinTone: st.id })}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition ${
                          appearance.skinTone === st.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-slate-950/60 shrink-0"
                          style={{ backgroundColor: st.base }}
                        />
                        <span className="truncate">{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <span className="text-xs font-medium text-slate-200">Sardas no Rosto</span>
                  <button
                    type="button"
                    onClick={() => updateAccessory({ freckles: !appearance.accessories.freckles })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      appearance.accessories.freckles
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {appearance.accessories.freckles ? 'Ativadas' : 'Desativadas'}
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Marcas Faciais</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FACIAL_MARK_STYLES.map(fm => (
                      <button
                        key={fm.id}
                        type="button"
                        onClick={() => updateAccessory({ facialMark: fm.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          appearance.accessories.facialMark === fm.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {fm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Olhos' && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Formato dos Olhos ({EYE_STYLES.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {EYE_STYLES.map(es => (
                      <button
                        key={es.id}
                        type="button"
                        onClick={() => update({ eyeStyle: es.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          appearance.eyeStyle === es.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {es.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Cor dos Olhos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EYE_COLORS.map(ec => (
                      <button
                        key={ec.id}
                        type="button"
                        onClick={() => update({ eyeColor: ec.id })}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition ${
                          appearance.eyeColor === ec.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: ec.hex }}
                        />
                        <span className="truncate">{ec.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Sobrancelhas' && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Formato das Sobrancelhas</h4>
                <div className="grid grid-cols-2 gap-2">
                  {EYEBROW_STYLES.map(eb => (
                    <button
                      key={eb.id}
                      type="button"
                      onClick={() => update({ eyebrowStyle: eb.id })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition ${
                        appearance.eyebrowStyle === eb.id
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {eb.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Cabelo' && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Cor do Cabelo</h4>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map(hc => (
                      <button
                        key={hc.id}
                        type="button"
                        title={hc.label}
                        onClick={() => update({ hairColor: hc.id })}
                        className={`w-7 h-7 rounded-full border-2 transition ${
                          appearance.hairColor === hc.id ? 'border-emerald-400 scale-110 shadow' : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: hc.base }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Penteado ({HAIR_STYLES.length} estilos)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {HAIR_STYLES.map(hs => (
                      <button
                        key={hs.id}
                        type="button"
                        onClick={() => update({ hairStyle: hs.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition truncate ${
                          appearance.hairStyle === hs.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {hs.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Barba' && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Estilo de Barba (visível a partir dos 16 anos)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FACIAL_HAIR_STYLES.map(fh => (
                      <button
                        key={fh.id}
                        type="button"
                        onClick={() => update({ facialHair: fh.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          appearance.facialHair === fh.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {fh.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Bigode</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MUSTACHE_STYLES.map(ms => (
                      <button
                        key={ms.id}
                        type="button"
                        onClick={() => update({ mustacheStyle: ms.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          (appearance.mustacheStyle || 'none') === ms.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {ms.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Acessórios' && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Óculos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GLASSES_STYLES.map(gl => (
                      <button
                        key={gl.id}
                        type="button"
                        onClick={() => updateAccessory({ glasses: gl.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          appearance.accessories.glasses === gl.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {gl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Brincos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {EARRING_STYLES.map(er => (
                      <button
                        key={er.id}
                        type="button"
                        onClick={() => updateAccessory({ earrings: er.id })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          appearance.accessories.earrings === er.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {er.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 mb-2">Roupa</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {SHIRT_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => update({ shirtColor: c })}
                          className={`w-6 h-6 rounded-full border-2 ${
                            appearance.shirtColor === c ? 'border-white scale-110' : 'border-slate-800'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 mb-2">Fundo do Retrato</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {BACKDROP_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => update({ backgroundColor: c })}
                          className={`w-6 h-6 rounded-full border-2 ${
                            appearance.backgroundColor === c ? 'border-emerald-400 scale-110' : 'border-slate-700'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {(onSave || onCancel) && (
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Cancelar
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Check size={15} /> Salvar Aparência
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      {showCompareStages && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Comparação de Envelhecimento (Mesma Identidade)</span>
            <span className="text-[11px] text-slate-400">0 meses → 105 anos</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {COMPARE_MILESTONES.map(ms => (
              <button
                key={ms.label}
                type="button"
                onClick={() => {
                  setUseCustomPreviewAge(true);
                  setPreviewMonths(ms.months);
                }}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-2 flex flex-col items-center gap-1 transition"
              >
                <CharacterFaceRenderer
                  appearance={appearance}
                  gender={gender}
                  ageMonths={ms.months}
                  expression={previewExpression}
                  size="sm"
                  showAgeBadge={false}
                />
                <span className="text-[10px] font-semibold text-slate-300 tabular-nums">{ms.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
