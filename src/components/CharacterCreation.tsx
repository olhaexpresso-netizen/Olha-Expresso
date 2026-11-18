import React, { useState } from 'react';
import { CharacterAppearance } from '../types';
import { CharacterVisualEngine } from '../services/CharacterVisualEngine';
import { CharacterFaceRenderer } from './CharacterFaceRenderer';
import { CharacterAppearanceEditor } from './CharacterAppearanceEditor';
import { WorldGeographyEngine } from '../services/WorldGeographyEngine';
import { BrazilHistoricalSimulationEngine } from '../services/BrazilHistoricalSimulationEngine';
import { User, ArrowRight, Dices, Palette } from 'lucide-react';

interface CharacterCreationProps {
  onCharacterCreated: (data: {
    firstName: string;
    lastName: string;
    gender: 'Masculino' | 'Feminino' | 'Outro';
    state: string;
    city: string;
    country: string;
    startingMoney: number;
    startYear: number;
    appearance: CharacterAppearance;
  }) => void;
  onCancel: () => void;
}

const FIRST_NAMES_M = ['João', 'Gabriel', 'Lucas', 'Mateus', 'Carlos', 'Pedro', 'Rafael', 'Bruno', 'Thiago', 'Marcos', 'Henrique', 'Felipe'];
const FIRST_NAMES_F = ['Maria', 'Ana', 'Julia', 'Beatriz', 'Larissa', 'Mariana', 'Camila', 'Bruna', 'Letícia', 'Gabriela', 'Amanda', 'Carolina'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro'];

const BRAZILIAN_CITIES: Record<string, string[]> = Object.fromEntries(
  WorldGeographyEngine.getCityOptionsForCharacterCreation().map((g) => [g.state, g.cities])
);

const START_ERA_PRESETS = [
  { year: 1900, label: '1900 — República Velha (Réis)' },
  { year: 1920, label: '1920 — Anos 1920 & Semana de Arte (Réis)' },
  { year: 1935, label: '1935 — Era Vargas (Réis)' },
  { year: 1960, label: '1960 — Inauguração de Brasília (Cruzeiro)' },
  { year: 1975, label: '1975 — Década de 70 (Cruzeiro)' },
  { year: 1988, label: '1988 — Constituição & Redemocratização (Cruzado)' },
  { year: 1994, label: '1994 — Plano Real (Real)' },
  { year: 2000, label: '2000 — Virada do Milênio (Padrão)' },
  { year: 2026, label: '2026 — Brasil Contemporâneo' },
];

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreated, onCancel }) => {
  const [gender, setGender] = useState<'Masculino' | 'Feminino' | 'Outro'>('Masculino');
  const [firstName, setFirstName] = useState('João');
  const [lastName, setLastName] = useState('Silva');
  const [state, setState] = useState('São Paulo');
  const [city, setCity] = useState('São Paulo');
  const [startYear, setStartYear] = useState<number>(2000);
  const [socialClass, setSocialClass] = useState<'pobre' | 'medio' | 'rico'>('medio');
  const [showAppearanceEditor, setShowAppearanceEditor] = useState(true);
  const [appearance, setAppearance] = useState<CharacterAppearance>(() =>
    CharacterVisualEngine.generateFromSeed('João_Silva_Masculino_init', 'Masculino')
  );

  const eraCurrency = BrazilHistoricalSimulationEngine.resolveCurrency(startYear);
  const eraScale = BrazilHistoricalSimulationEngine.getNominalEraScaleForStart(startYear);
  const poorNominal = Math.round(300000 * eraScale);
  const midNominal = Math.round(1500000 * eraScale);
  const richNominal = Math.round(100000000 * eraScale);

  const handleGenderChange = (nextGender: 'Masculino' | 'Feminino' | 'Outro') => {
    setGender(nextGender);
    setAppearance(
      CharacterVisualEngine.generateFromSeed(`${firstName}_${lastName}_${nextGender}_${Date.now()}`, nextGender)
    );
  };

  const handleRandomize = () => {
    const chosenGender = Math.random() > 0.5 ? 'Masculino' : 'Feminino';
    const pool = chosenGender === 'Masculino' ? FIRST_NAMES_M : FIRST_NAMES_F;
    const nextFirst = pool[Math.floor(Math.random() * pool.length)];
    const nextLast = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    setGender(chosenGender);
    setFirstName(nextFirst);
    setLastName(nextLast);

    const states = Object.keys(BRAZILIAN_CITIES);
    const randomState = states[Math.floor(Math.random() * states.length)];
    setState(randomState);
    const cities = BRAZILIAN_CITIES[randomState];
    setCity(cities[Math.floor(Math.random() * cities.length)]);

    setAppearance(
      CharacterVisualEngine.generateFromSeed(
        `${nextFirst}_${nextLast}_${chosenGender}_${Math.random().toString(36).slice(2, 7)}`,
        chosenGender
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let startingMoney = midNominal;
    if (socialClass === 'pobre') startingMoney = poorNominal;
    if (socialClass === 'rico') startingMoney = richNominal;

    onCharacterCreated({
      firstName: firstName.trim() || 'João',
      lastName: lastName.trim() || 'Silva',
      gender,
      state,
      city,
      country: 'Brasil',
      startingMoney,
      startYear,
      appearance,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-white my-6 max-h-[94vh] flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 id="create-title" className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <User size={22} /> Criar Novo Personagem
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">Configure sua identidade, UF (27 estados) e época inicial no Brasil</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAppearanceEditor((v) => !v)}
              className="bg-slate-950/30 hover:bg-slate-950/50 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-white/20"
            >
              <Palette size={15} /> {showAppearanceEditor ? 'Ocultar Editor' : 'Personalizar Rosto'}
            </button>
            <button
              type="button"
              onClick={handleRandomize}
              className="bg-emerald-800/80 hover:bg-emerald-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-500/40 shadow"
            >
              <Dices size={16} /> Aleatório
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
            {!showAppearanceEditor && (
              <CharacterFaceRenderer
                appearance={appearance}
                gender={gender}
                age={20}
                expression="Feliz"
                size="lg"
              />
            )}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Sobrenome</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Gênero</label>
                <select
                  value={gender}
                  onChange={(e) => handleGenderChange(e.target.value as 'Masculino' | 'Feminino' | 'Outro')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Estado (27 UFs)</label>
                <select
                  value={state}
                  onChange={(e) => {
                    const st = e.target.value;
                    setState(st);
                    setCity(BRAZILIAN_CITIES[st]?.[0] || 'Capital');
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(BRAZILIAN_CITIES).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Cidade</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {(BRAZILIAN_CITIES[state] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Condição Inicial ({eraCurrency.symbol})</label>
                <select
                  value={socialClass}
                  onChange={(e) => setSocialClass(e.target.value as 'pobre' | 'medio' | 'rico')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="pobre">Humilde ({BrazilHistoricalSimulationEngine.formatMoney(poorNominal, eraCurrency)})</option>
                  <option value="medio">Classe Média ({BrazilHistoricalSimulationEngine.formatMoney(midNominal, eraCurrency)})</option>
                  <option value="rico">Afluente ({BrazilHistoricalSimulationEngine.formatMoney(richNominal, eraCurrency)})</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ano Inicial & Época Histórica</label>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {START_ERA_PRESETS.map((preset) => (
                    <option key={preset.year} value={preset.year}>{preset.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {showAppearanceEditor && (
            <CharacterAppearanceEditor
              appearance={appearance}
              gender={gender}
              age={0}
              onChange={setAppearance}
            />
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              Iniciar Vida <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
