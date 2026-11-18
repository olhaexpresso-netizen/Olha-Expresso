import React, { useState } from 'react';
import {
  History,
  Calendar,
  Briefcase,
  GraduationCap,
  Heart,
  DollarSign,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TimelineVisualizerProps {
  history: {
    age: number;
    year: number;
    month?: number;
    summary: string;
    worldSummary?: string;
  }[];
  compact?: boolean;
}

const PAGE_SIZE = 40;

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({ history, compact = false }) => {
  const [page, setPage] = useState(0);

  const reversed = [...history].reverse();
  const totalPages = Math.max(1, Math.ceil(reversed.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const slice = reversed.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const getEventIcon = (summary: string) => {
    const text = summary.toLowerCase();
    if (text.includes('emprego') || text.includes('trabalho') || text.includes('carreira'))
      return <Briefcase size={15} className="text-emerald-400" />;
    if (text.includes('estudo') || text.includes('escola') || text.includes('faculdade') || text.includes('formatur'))
      return <GraduationCap size={15} className="text-sky-400" />;
    if (text.includes('família') || text.includes('filho') || text.includes('casamento') || text.includes('nasceu'))
      return <Heart size={15} className="text-rose-400" />;
    if (text.includes('dinheiro') || text.includes('compra') || text.includes('salário'))
      return <DollarSign size={15} className="text-amber-400" />;
    if (text.includes('crime') || text.includes('preso') || text.includes('polícia'))
      return <ShieldAlert size={15} className="text-rose-500" />;
    return <Sparkles size={15} className="text-teal-400" />;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <History size={20} className="text-emerald-400" /> Histórico Pessoal & Contexto Mundial
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-300 font-medium tabular-nums">
          <span>{history.length} Registro(s)</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                {safePage + 1}/{totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                aria-label="Próxima página"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
          Nenhum registro na linha do tempo ainda.
        </div>
      ) : (
        <div
          className={`relative pl-6 ${compact ? 'space-y-2.5' : 'space-y-4'} before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800`}
        >
          {slice.map((item, idx) => (
            <div key={`${item.year}_${item.age}_${safePage}_${idx}`} className="relative flex items-start gap-4 group">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shadow-lg">
                {getEventIcon(item.summary)}
              </div>

              <div className={`flex-1 bg-slate-900 border border-slate-800 rounded-2xl ${compact ? 'p-3' : 'p-4'} shadow-lg`}>
                <div className="flex items-center justify-between mb-1.5 tabular-nums">
                  <span className="text-xs font-bold text-emerald-400">{item.age} anos</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> Ano {item.year}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">{item.summary}</p>
                {!compact && item.worldSummary && (
                  <p className="text-xs text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
                    {item.worldSummary}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
