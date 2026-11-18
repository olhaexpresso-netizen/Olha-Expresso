import React from 'react';
import { Character, LifeEvent } from '../types';
import { formatTruthStatusLabel } from '../types/world';
import { CharacterFaceRenderer } from './CharacterFaceRenderer';
import { CharacterExpressionEngine } from '../services/CharacterExpressionEngine';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface EventModalProps {
  event: LifeEvent;
  character?: Character;
  onSelectChoice: (choiceId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, character, onSelectChoice }) => {
  const eventExpression = CharacterExpressionEngine.resolveFromEvent(event);

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-200" size={20} />
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
              Acontecimento · {event.category} · Idade {event.age}
            </span>
          </div>
          <span className="text-xs bg-emerald-800/60 px-2.5 py-1 rounded-full font-medium tabular-nums">
            Ano {event.year}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            {character && (
              <CharacterFaceRenderer
                character={character}
                age={event.age}
                ageMonths={event.age === character.currentAge && character.ageMonths !== undefined ? character.ageMonths : event.age * 12}
                expression={eventExpression}
                size="lg"
                showAgeBadge={false}
              />
            )}
            <div className="flex-1 min-w-0">
              <h2 id="event-modal-title" className="text-xl font-bold text-slate-100 mb-2">{event.title}</h2>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                {event.description}
              </p>
              {event.worldContextNote && (
                <p className="text-[11px] text-emerald-400 mt-2">
                  {event.worldContextNote}
                  {event.truthStatus ? ` · ${formatTruthStatusLabel(event.truthStatus)}` : ''}
                </p>
              )}
            </div>
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            O que você deseja fazer?
          </h3>

          <div className="space-y-2.5">
            {event.choices && event.choices.length > 0 ? (
              event.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => onSelectChoice(choice.id)}
                  className="w-full text-left bg-slate-800 hover:bg-emerald-950/40 hover:border-emerald-600/60 border border-slate-700 p-3.5 rounded-xl transition flex items-start justify-between group shadow-sm"
                >
                  <div>
                    <div className="font-medium text-sm text-slate-200 group-hover:text-emerald-300 transition">
                      {choice.text}
                    </div>
                    {choice.effectDescription && (
                      <div className="text-xs text-slate-400 mt-1 italic">
                        {choice.effectDescription}
                      </div>
                    )}
                  </div>
                  <CheckCircle2 size={18} className="text-slate-600 group-hover:text-emerald-400 shrink-0 mt-0.5 transition" />
                </button>
              ))
            ) : (
              <button
                onClick={() => onSelectChoice('b')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm transition"
              >
                Continuar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
