import React, { useEffect, useState } from 'react';
import {
  CatalogEventDefinition,
  EventCatalogCategory,
  WorldTruthStatus,
  formatTruthStatusLabel,
} from '../../types';
import { fetchEventCatalog } from '../../services/api';
import { BookOpen, Search, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogTabProps {
  currentYear: number;
  onTriggerCatalogEvent: (category?: EventCatalogCategory) => Promise<void> | void;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  currentYear,
  onTriggerCatalogEvent,
}) => {
  const [category, setCategory] = useState<EventCatalogCategory | 'Todas'>('Todas');
  const [search, setSearch] = useState('');
  const [onlyCurrentYear, setOnlyCurrentYear] = useState(false);
  const [truthStatus, setTruthStatus] = useState<WorldTruthStatus | ''>('');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<CatalogEventDefinition[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchEventCatalog({
          category,
          search: search.trim() || undefined,
          year: onlyCurrentYear ? currentYear : undefined,
          truthStatus: truthStatus || undefined,
          page,
          pageSize: 12,
        });
        if (!cancelled) {
          setItems(res.items);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setCategoryCounts(res.categoryCounts);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Erro ao carregar catálogo de eventos.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category, search, onlyCurrentYear, currentYear, truthStatus, page]);

  const categories = Object.keys(categoryCounts) as EventCatalogCategory[];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-emerald-400" />
              Enciclopédia & Catálogo de Eventos ({total.toLocaleString('pt-BR')} resultados)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Base estruturada com mais de 11.800 acontecimentos distintos distribuídos em 22 categorias, coerentes com época, idade e cadeias causais.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onTriggerCatalogEvent(category === 'Todas' ? undefined : category)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <Sparkles size={14} /> Sortear Evento Elegível Agora
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Buscar evento no catálogo"
              placeholder="Buscar título, tema ou tag..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            aria-label="Filtrar por categoria"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as EventCatalogCategory | 'Todas');
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="Todas">Todas as 22 Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({categoryCounts[cat]})
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar estatuto histórico"
            value={truthStatus}
            onChange={(e) => {
              setTruthStatus(e.target.value as WorldTruthStatus | '');
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="">Todos os Estatutos Históricos</option>
            <option value="HISTORICAL_FACT">Fato Histórico Real</option>
            <option value="SIMULATED_EVENT">Evento Simulado</option>
            <option value="FUTURE_PROJECTION">Projeção Futura</option>
            <option value="ALTERNATIVE_HISTORY">História Alternativa</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setOnlyCurrentYear((v) => !v);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition border whitespace-nowrap ${
              onlyCurrentYear
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {onlyCurrentYear ? `Apenas ano ${currentYear}` : `Filtrar pelo ano ${currentYear}`}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-900 text-rose-200 rounded-xl p-4 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-400">
          Nenhum acontecimento encontrado com esses filtros. Tente ampliar a pesquisa.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((ev) => (
            <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5 tabular-nums">
                <span className="text-emerald-400 font-semibold">{ev.category}</span>
                <span aria-hidden="true">·</span>
                <span>{ev.subcategory}</span>
                <span aria-hidden="true">·</span>
                <span>{ev.minYear}–{ev.maxYear}</span>
                <span aria-hidden="true">·</span>
                <span>{formatTruthStatusLabel(ev.truthStatus)}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{ev.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs text-slate-400">
                {ev.choices.map((c) => (
                  <div key={c.id}>
                    • <strong className="text-slate-200">{c.text}</strong> — {c.effectDescription}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-xs tabular-nums">
        <span className="text-slate-400">
          Página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
          >
            Próxima <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
