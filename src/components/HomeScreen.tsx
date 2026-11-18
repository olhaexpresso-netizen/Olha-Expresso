import React, { useMemo } from 'react';
import { Play, FolderOpen, ShieldCheck, Sparkles, Award, Palette } from 'lucide-react';
import { CharacterFaceRenderer } from './CharacterFaceRenderer';
import { CharacterVisualEngine } from '../services/CharacterVisualEngine';

interface HomeScreenProps {
  onStartNew: () => void;
  onOpenSaves: () => void;
  onOpenGallery: () => void;
  savedGamesCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartNew,
  onOpenSaves,
  onOpenGallery,
  savedGamesCount,
}) => {
  const sampleCast = useMemo(
    () => [
      {
        appearance: CharacterVisualEngine.generateFromSeed('home_cast_maria', 'Feminino', 'home_1'),
        gender: 'Feminino' as const,
        age: 26,
        expression: 'Feliz' as const,
      },
      {
        appearance: CharacterVisualEngine.generateFromSeed('home_cast_joao', 'Masculino', 'home_2'),
        gender: 'Masculino' as const,
        age: 29,
        expression: 'Neutra' as const,
      },
      {
        appearance: CharacterVisualEngine.generateFromSeed('home_cast_bebe', 'Feminino', 'home_3'),
        gender: 'Feminino' as const,
        age: 1,
        expression: 'Feliz' as const,
      },
      {
        appearance: CharacterVisualEngine.generateFromSeed('home_cast_idoso', 'Masculino', 'home_4'),
        gender: 'Masculino' as const,
        age: 72,
        expression: 'Feliz' as const,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full text-center relative z-10 space-y-8">
        {/* Clean text kicker */}
        <p className="text-emerald-400 text-xs font-semibold tracking-wider uppercase">
          Simulador de Vida Brasileiro · Personagens Ilustrados 2D
        </p>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
            VIDA REAL BR
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Viva uma vida completa no Brasil, do nascimento à velhice. Tome decisões, construa carreiras, forme família e crie seu legado.
          </p>
        </div>

        {/* 2D Cast Preview */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
          {sampleCast.map((c, idx) => (
            <CharacterFaceRenderer
              key={idx}
              appearance={c.appearance}
              gender={c.gender}
              age={c.age}
              expression={c.expression}
              size="lg"
              showAgeBadge={true}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartNew}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-3 text-base border border-emerald-500/40 whitespace-nowrap"
          >
            <Play size={20} fill="currentColor" /> Nova Vida
          </button>

          <button
            onClick={onOpenSaves}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-4 rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2.5 text-base whitespace-nowrap tabular-nums"
          >
            <FolderOpen size={20} /> Partidas Salvas ({savedGamesCount})
          </button>

          <button
            onClick={onOpenGallery}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-emerald-300 font-semibold px-5 py-4 rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 text-sm whitespace-nowrap"
          >
            <Palette size={18} /> Galeria 2D
          </button>
        </div>

        {/* Footer features */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Identidade Persistente</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Sparkles size={18} className="text-teal-400" />
            <span>Envelhecimento & Expressões</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Award size={18} className="text-amber-400" />
            <span>Árvore Genealógica</span>
          </div>
        </div>
      </div>
    </div>
  );
};
