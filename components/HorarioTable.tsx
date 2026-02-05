\"use client\";

import React, { useMemo, useState } from \"react\";
import Modal from \"./Modal\";
import { useMediaQuery } from \"@/hooks/useMediaQuery\";

export type Turno = \"AM\" | \"PM\" | \"LIBRE\" | \"VAC\" | \"FULL\" | \"\" | string;

export type HorarioRow = {
  subcargo: string;
  nombre: string;
  turnos: Record<string, Turno>;
};

type Props = {
  data: HorarioRow[];
};

const FILTERS = [
  { label: \"Todos\", value: \"ALL\" },
  { label: \"Solo LIBRE\", value: \"LIBRE\" },
  { label: \"Solo AM\", value: \"AM\" },
  { label: \"Solo PM\", value: \"PM\" },
  { label: \"Solo VAC/FULL\", value: \"VAC_FULL\" }
] as const;

function formatDateLabel(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(\"es-CL\", {
    weekday: \"short\",
    day: \"2-digit\",
    month: \"2-digit\"
  }).format(d);
}

function turnoClasses(turno: Turno) {
  switch (turno) {
    case \"AM\":
      return \"bg-turno-am/15 text-turno-am border-turno-am/40\";
    case \"PM\":
      return \"bg-turno-pm/15 text-turno-pm border-turno-pm/40\";
    case \"LIBRE\":
      return \"bg-turno-libre/15 text-turno-libre border-turno-libre/40\";
    case \"VAC\":
      return \"bg-turno-vac/15 text-turno-vac border-turno-vac/40\";
    case \"FULL\":
      return \"bg-turno-full/15 text-turno-full border-turno-full/40\";
    default:
      return \"bg-slate-100 text-slate-500 border-slate-200\";
  }
}

function matchesFilter(turno: Turno, filter: string) {
  if (filter === \"ALL\") return true;
  if (filter === \"VAC_FULL\") return turno === \"VAC\" || turno === \"FULL\";
  return turno === filter;
}

export default function HorarioTable({ data }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number][\"value\"]>(\"ALL\");
  const [search, setSearch] = useState(\"\");
  const [selected, setSelected] = useState<{
    date: string;
    turno: Turno;
    subcargo: string;
    nombre: string;
  } | null>(null);
  const isMobile = useMediaQuery(\"(max-width: 640px)\");

  const dates = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      Object.keys(row.turnos).forEach((date) => set.add(date));
    });
    return Array.from(set).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return data.filter((row) => {
      if (lower && !row.nombre.toLowerCase().includes(lower)) return false;
      if (filter === \"ALL\") return true;
      return dates.some((date) => matchesFilter(row.turnos[date] || \"\", filter));
    });
  }, [data, search, filter, dates]);

  const grouped = useMemo(() => {
    const map = new Map<string, HorarioRow[]>();
    filteredData.forEach((row) => {
      const key = row.subcargo || \"Sin subcargo\";
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(row);
    });
    return Array.from(map.entries());
  }, [filteredData]);

  const companions = useMemo(() => {
    if (!selected) return [];
    return data.filter((row) => {
      if (row.subcargo !== selected.subcargo) return false;
      if (row.nombre === selected.nombre) return false;
      return row.turnos[selected.date] === selected.turno;
    });
  }, [data, selected]);

  return (
    <div className=\"space-y-6\">
      <div className=\"flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm\">
        <div className=\"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between\">
          <div className=\"space-y-1\">
            <h2 className=\"text-xl font-bold\">Mis Horarios Feb 2026</h2>
            <p className=\"text-sm text-slate-500\">Vista agrupada por subcargo</p>
          </div>
          <div className=\"flex items-center gap-2\">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder=\"Buscar por nombre...\"
              className=\"w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none sm:w-64\"
            />
          </div>
        </div>
        <div className=\"flex flex-wrap gap-2\">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                filter === f.value
                  ? \"border-slate-900 bg-slate-900 text-white\"
                  : \"border-slate-200 text-slate-600 hover:border-slate-400\"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isMobile ? (
        <div className=\"space-y-4\">
          {grouped.map(([subcargo, rows]) => (
            <div key={subcargo} className=\"rounded-2xl border border-slate-200 bg-white p-4 shadow-sm\">
              <div className=\"mb-3 flex items-center justify-between\">
                <div>
                  <p className=\"text-xs font-semibold uppercase tracking-wide text-slate-400\">Subcargo</p>
                  <p className=\"text-base font-bold text-slate-800\">{subcargo}</p>
                </div>
                <span className=\"rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600\">
                  {rows.length} personas
                </span>
              </div>
              <div className=\"space-y-3\">
                {rows.map((row) => (
                  <details key={row.nombre} className=\"rounded-xl border border-slate-100 bg-slate-50 px-3 py-2\">
                    <summary className=\"cursor-pointer list-none text-sm font-semibold text-slate-800\">
                      {row.nombre}
                    </summary>
                    <div className=\"mt-3 grid gap-2\">
                      {dates.map((date) => {
                        const turno = row.turnos[date] || \"\";
                        const visible = matchesFilter(turno, filter);
                        return (
                          <button
                            key={date}
                            type=\"button\"
                            onClick={() =>
                              turno &&
                              visible &&
                              setSelected({ date, turno, subcargo: row.subcargo, nombre: row.nombre })
                            }
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold ${
                              visible ? turnoClasses(turno) : \"border-slate-200 bg-slate-100 text-slate-400\"
                            }`}
                          >
                            <span>{formatDateLabel(date)}</span>
                            <span>{visible ? turno || \"—\" : \"—\"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className=\"rounded-2xl border border-slate-200 bg-white shadow-sm\">
          <div className=\"overflow-x-auto scrollbar-thin\">
            <table className=\"min-w-full border-collapse text-sm\">
              <thead className=\"sticky top-0 bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500\">
                <tr>
                  <th className=\"px-4 py-3\">Subcargo</th>
                  <th className=\"px-4 py-3\">Nombre</th>
                  {dates.map((date) => (
                    <th key={date} className=\"px-4 py-3 whitespace-nowrap\">
                      {formatDateLabel(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map(([subcargo, rows]) =>
                  rows.map((row, idx) => (
                    <tr key={`${row.nombre}-${idx}`} className=\"border-t border-slate-100\">
                      <td className=\"px-4 py-3 text-xs font-semibold text-slate-500\">
                        {idx === 0 ? subcargo : \"\"}
                      </td>
                      <td className=\"px-4 py-3 font-semibold text-slate-800\">{row.nombre}</td>
                      {dates.map((date) => {
                        const turno = row.turnos[date] || \"\";
                        const visible = matchesFilter(turno, filter);
                        return (
                          <td key={date} className=\"px-2 py-2\">
                            <button
                              type=\"button\"
                              onClick={() =>
                                turno &&
                                visible &&
                                setSelected({ date, turno, subcargo: row.subcargo, nombre: row.nombre })
                              }
                              className={`w-full rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                                visible ? turnoClasses(turno) : \"border-slate-200 bg-slate-100 text-slate-400\"
                              }`}
                            >
                              {visible ? turno || \"—\" : \"—\"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        title={selected ? `Compañeros en tu turno (${selected.turno})` : \"\"}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className=\"space-y-2 text-sm\">
            <div className=\"rounded-xl border border-slate-200 bg-slate-50 p-3\">
              <div className=\"font-semibold text-slate-700\">
                {selected.subcargo} · {formatDateLabel(selected.date)}
              </div>
              <div className=\"text-xs text-slate-500\">Turno: {selected.turno}</div>
            </div>
            {companions.length > 0 ? (
              <ul className=\"space-y-2\">
                {companions.map((p) => (
                  <li key={p.nombre} className=\"rounded-lg border border-slate-100 bg-white px-3 py-2\">
                    <div className=\"font-semibold text-slate-800\">{p.nombre}</div>
                    <div className=\"text-xs text-slate-500\">{p.subcargo}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className=\"text-slate-500\">No hay compañeros en este turno.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
