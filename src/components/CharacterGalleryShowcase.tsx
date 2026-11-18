import React, { useMemo, useState } from 'react';
import { CharacterFaceRenderer } from './CharacterFaceRenderer';
import { CharacterVisualEngine } from '../services/CharacterVisualEngine';
import { CharacterAppearanceGenerator } from '../services/CharacterAppearanceGenerator';
import { ALL_EXPRESSIONS } from '../services/CharacterExpressionEngine';
import { AGE_STAGE_DEFS, AdvancedLifecycleVisualEngine } from '../services/AdvancedLifecycleVisualEngine';
import { FacialExpression } from '../types';
import { ArrowLeft, Users, Clock, Smile, GitBranch, Layers } from 'lucide-react';

interface CharacterGalleryShowcaseProps {
  onBack: () => void;
}

const SAMPLE_PROFILES = [
  { name: 'Enzo Gabriel', gender: 'Masculino' as const, ageMonths: 0, seed: 'br_03_enzo' },
  { name: 'Alice Mendes', gender: 'Feminino' as const, ageMonths: 4, seed: 'br_31_alice' },
  { name: 'Lucas Baby', gender: 'Masculino' as const, ageMonths: 9, seed: 'br_01_lucas' },
  { name: 'Sofia Barbosa', gender: 'Feminino' as const, ageMonths: 24, seed: 'br_18_sofia' },
  { name: 'Valentina Silva', gender: 'Feminino' as const, ageMonths: 60, seed: 'br_04_valentina' },
  { name: 'Caio Martins', gender: 'Masculino' as const, ageMonths: 120, seed: 'br_15_caio' },
  { name: 'Larissa Gomes', gender: 'Feminino' as const, ageMonths: 168, seed: 'br_12_larissa' },
  { name: 'Matheus Santos', gender: 'Masculino' as const, ageMonths: 198, seed: 'br_05_matheus' },
  { name: 'Beatriz Almeida', gender: 'Feminino' as const, ageMonths: 252, seed: 'br_10_beatriz' },
  { name: 'Mariana Costa', gender: 'Feminino' as const, ageMonths: 312, seed: 'br_02_mariana' },
  { name: 'Camila Ferreira', gender: 'Feminino' as const, ageMonths: 348, seed: 'br_06_camila' },
  { name: 'Thiago Ribeiro', gender: 'Masculino' as const, ageMonths: 408, seed: 'br_09_thiago' },
  { name: 'Rafael Souza', gender: 'Masculino' as const, ageMonths: 504, seed: 'br_11_rafael' },
  { name: 'Amanda Rocha', gender: 'Feminino' as const, ageMonths: 372, seed: 'br_14_amanda' },
  { name: 'Juliana Dias', gender: 'Feminino' as const, ageMonths: 576, seed: 'br_16_juliana' },
  { name: 'Pedro Henrique', gender: 'Masculino' as const, ageMonths: 324, seed: 'br_17_pedro' },
  { name: 'Felipe Cardoso', gender: 'Masculino' as const, ageMonths: 456, seed: 'br_19_felipe' },
  { name: 'Isabela Nunes', gender: 'Feminino' as const, ageMonths: 276, seed: 'br_20_isabela' },
  { name: 'Bruno Pereira', gender: 'Masculino' as const, ageMonths: 660, seed: 'br_13_bruno' },
  { name: 'Fernanda Carvalho', gender: 'Feminino' as const, ageMonths: 696, seed: 'br_24_fernanda' },
  { name: 'Gustavo Teixeira', gender: 'Masculino' as const, ageMonths: 744, seed: 'br_21_gustavo' },
  { name: 'Letícia Correia', gender: 'Feminino' as const, ageMonths: 420, seed: 'br_22_leticia' },
  { name: 'Rodrigo Mendes', gender: 'Masculino' as const, ageMonths: 264, seed: 'br_23_rodrigo' },
  { name: 'Vinícius Araujo', gender: 'Masculino' as const, ageMonths: 228, seed: 'br_25_vinicius' },
  { name: 'Carolina Lopes', gender: 'Feminino' as const, ageMonths: 336, seed: 'br_26_carolina' },
  { name: 'Diego Moreira', gender: 'Masculino' as const, ageMonths: 540, seed: 'br_27_diego' },
  { name: 'Patrícia Vieira', gender: 'Feminino' as const, ageMonths: 804, seed: 'br_28_patricia' },
  { name: 'Seu Joaquim', gender: 'Masculino' as const, ageMonths: 900, seed: 'br_07_joaquim' },
  { name: 'Dona Tereza', gender: 'Feminino' as const, ageMonths: 1032, seed: 'br_08_tereza' },
  { name: 'Seu Benedito', gender: 'Masculino' as const, ageMonths: 1272, seed: 'br_29_leonardo' },
];

// 16 required canonical aging points
const TIMELINE_16_AGES = [
  { label: 'Recém-nascido (0m)', months: 0 },
  { label: '6 meses', months: 6 },
  { label: '2 anos', months: 24 },
  { label: '5 anos', months: 60 },
  { label: '10 anos', months: 120 },
  { label: '15 anos', months: 180 },
  { label: '18 anos', months: 216 },
  { label: '25 anos', months: 300 },
  { label: '35 anos', months: 420 },
  { label: '45 anos', months: 540 },
  { label: '55 anos', months: 660 },
  { label: '65 anos', months: 780 },
  { label: '75 anos', months: 900 },
  { label: '85 anos', months: 1020 },
  { label: '95 anos', months: 1140 },
  { label: '105 anos', months: 1260 },
];

const EXPRESSION_AGE_POINTS = [
  { label: 'Bebê (6m)', months: 6 },
  { label: 'Criança (6a)', months: 72 },
  { label: 'Adulto (30a)', months: 360 },
  { label: 'Idoso (80a)', months: 960 },
];

export const CharacterGalleryShowcase: React.FC<CharacterGalleryShowcaseProps> = ({ onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState(9); // Mariana Costa default
  const [activeExpression, setActiveExpression] = useState<FacialExpression>('Feliz');

  const characters = useMemo(
    () =>
      SAMPLE_PROFILES.map((p, idx) => ({
        ...p,
        appearance: CharacterVisualEngine.generateFromSeed(p.seed, p.gender, `demo_${idx + 1}`),
      })),
    []
  );

  const selectedChar = characters[selectedIndex];

  const inheritanceDemo = useMemo(() => {
    const father = CharacterVisualEngine.generateFromSeed('family_father_marcos', 'Masculino', 'fam_pai');
    const mother = CharacterVisualEngine.generateFromSeed('family_mother_clara', 'Feminino', 'fam_mae');
    const son = CharacterAppearanceGenerator.inheritFromParents('fam_filho', 'child_son_01', 'Masculino', father, mother);
    const daughter = CharacterAppearanceGenerator.inheritFromParents('fam_filha', 'child_daughter_02', 'Feminino', father, mother);
    const sibling2 = CharacterAppearanceGenerator.inheritFromParents('fam_irmao2', 'child_son_03', 'Masculino', father, mother);
    const sibling3 = CharacterAppearanceGenerator.inheritFromParents('fam_irma3', 'child_daughter_04', 'Feminino', father, mother);
    return { father, mother, son, daughter, sibling2, sibling3 };
  }, []);

  const libStats = CharacterVisualEngine.getLibrariesSummary();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Estúdio Visual 2D — Ciclo de Vida Completo (v9.0)</h1>
            <p className="text-xs text-slate-400 mt-1 tabular-nums">
              {libStats.ageStages} estágios etários (0m a 120a) · {libStats.faceShapes} formatos faciais · {libStats.skinTones} tons de pele · {libStats.hairStyles} penteados · {ALL_EXPRESSIONS.length} expressões adaptadas por idade
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
          >
            <ArrowLeft size={15} /> Voltar ao Início
          </button>
        </div>

        {/* Lifecycle Bar: 19 Canonical Stages */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2 text-slate-200">
              <Layers size={16} className="text-emerald-400" /> Linha Completa das 19 Fases da Vida Humana
            </h2>
            <span className="text-[11px] text-slate-400 tabular-nums">0 meses → 105+ anos</span>
          </div>
          <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
            {AGE_STAGE_DEFS.map((st, i) => (
              <div
                key={st.id}
                className="min-w-[104px] bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-2 flex flex-col justify-between shrink-0"
              >
                <span className="text-[10px] font-bold text-emerald-400 tabular-nums">#{i + 1} · {st.ageRangeText}</span>
                <span className="text-[11px] font-semibold text-white leading-tight mt-0.5">{st.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1: 30 Diverse Characters Across All Life Stages */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Users size={18} className="text-emerald-400" /> 30 Personagens Determinísticos (Recém-nascido a Centenário)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Expressão global:</span>
              <select
                value={activeExpression}
                onChange={e => setActiveExpression(e.target.value as FacialExpression)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                {ALL_EXPRESSIONS.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {characters.map((c, idx) => {
              const stage = AdvancedLifecycleVisualEngine.resolveAgeStage(c.ageMonths);
              const stageLabel = AdvancedLifecycleVisualEngine.getStageLabel(stage);
              return (
                <button
                  key={c.seed}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`bg-slate-900 border rounded-2xl p-3 flex flex-col items-center gap-2 text-center transition ${
                    selectedIndex === idx
                      ? 'border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CharacterFaceRenderer
                    appearance={c.appearance}
                    gender={c.gender}
                    ageMonths={c.ageMonths}
                    expression={activeExpression}
                    size="lg"
                    showAgeBadge={true}
                  />
                  <div className="w-full min-w-0">
                    <div className="text-xs font-bold text-white truncate">{c.name}</div>
                    <div className="text-[11px] text-slate-400 tabular-nums truncate">
                      {AdvancedLifecycleVisualEngine.formatAgeDisplay(c.ageMonths)} · {stageLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Same Character 16-Point Lifecycle Timeline (0m -> 105a) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" /> Linha do Tempo Visual — 16 Marcos ({selectedChar.name})
            </h2>
            <span className="text-xs text-slate-400">Identidade genética preservada de 0 meses aos 105 anos</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {TIMELINE_16_AGES.map(pt => {
              const stageLabel = AdvancedLifecycleVisualEngine.getStageLabel(
                AdvancedLifecycleVisualEngine.resolveAgeStage(pt.months)
              );
              return (
                <div key={pt.months} className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center gap-1.5 text-center">
                  <CharacterFaceRenderer
                    appearance={selectedChar.appearance}
                    gender={selectedChar.gender}
                    ageMonths={pt.months}
                    expression={activeExpression}
                    size="md"
                    showAgeBadge={true}
                  />
                  <span className="text-[11px] font-semibold text-slate-200 tabular-nums">{pt.label}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">{stageLabel}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Expressions Adapted by Age Stage */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Smile size={18} className="text-emerald-400" /> Expressões em Diferentes Idades ({selectedChar.name})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-2 pr-4 font-semibold">Idade</th>
                  {(['Neutra', 'Feliz', 'Choro', 'Triste', 'Surpresa', 'Irritada'] as FacialExpression[]).map(exp => (
                    <th key={exp} className="py-2 px-2 text-center font-semibold">{exp}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {EXPRESSION_AGE_POINTS.map(agePt => (
                  <tr key={agePt.months}>
                    <td className="py-2.5 pr-4 text-xs font-semibold text-slate-200 whitespace-nowrap">{agePt.label}</td>
                    {(['Neutra', 'Feliz', 'Choro', 'Triste', 'Surpresa', 'Irritada'] as FacialExpression[]).map(exp => (
                      <td key={exp} className="py-2.5 px-2">
                        <div className="flex justify-center">
                          <CharacterFaceRenderer
                            appearance={selectedChar.appearance}
                            gender={selectedChar.gender}
                            ageMonths={agePt.months}
                            expression={exp}
                            size="sm"
                            showAgeBadge={false}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Parents, Children & Siblings Comparison */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <GitBranch size={18} className="text-emerald-400" /> Herança Genética: Pais, Filhos & Irmãos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center gap-2 text-center">
              <CharacterFaceRenderer appearance={inheritanceDemo.father} gender="Masculino" age={38} expression="Feliz" size="lg" showAgeBadge={true} />
              <span className="text-xs font-bold text-white">Marcos (Pai)</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center gap-2 text-center">
              <CharacterFaceRenderer appearance={inheritanceDemo.mother} gender="Feminino" age={36} expression="Feliz" size="lg" showAgeBadge={true} />
              <span className="text-xs font-bold text-white">Clara (Mãe)</span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-3.5 flex flex-col items-center gap-2 text-center">
              <CharacterFaceRenderer appearance={inheritanceDemo.son} gender="Masculino" age={16} expression="Feliz" size="lg" showAgeBadge={true} />
              <span className="text-xs font-bold text-emerald-300">Lucas (Irmão 1)</span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-3.5 flex flex-col items-center gap-2 text-center">
              <CharacterFaceRenderer appearance={inheritanceDemo.daughter} gender="Feminino" age={12} expression="Feliz" size="lg" showAgeBadge={true} />
              <span className="text-xs font-bold text-emerald-300">Sofia (Irmã 2)</span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-3.5 flex flex-col items-center gap-2 text-center">
              <CharacterFaceRenderer appearance={inheritanceDemo.sibling2} gender="Masculino" age={5} expression="Feliz" size="lg" showAgeBadge={true} />
              <span className="text-xs font-bold text-emerald-300">Pedro (Irmão 3)</span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-3.5 flex flex-col items-center gap-2 text-center">
              <CharacterFaceRenderer appearance={inheritanceDemo.sibling3} gender="Feminino" ageMonths={6} expression="Feliz" size="lg" showAgeBadge={true} />
              <span className="text-xs font-bold text-emerald-300">Ana (Irmã 4 · 6m)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
