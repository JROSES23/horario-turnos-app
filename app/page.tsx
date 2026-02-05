\"use client";

import React, { useEffect, useMemo, useState } from \"react\";
import HorarioTable, { HorarioRow } from \"@/components/HorarioTable\";

type ApiResponse = {
  data: HorarioRow[];
  message: string;
  sheetName: string;
  sheets: string[];
};

const STORAGE_KEY = \"horarios:data:v1\";

export default function HomePage() {
  const [data, setData] = useState<HorarioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState<string>(\"OPS FEB\");
  const [sheets, setSheets] = useState<string[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as ApiResponse;
      setData(parsed.data || []);
      setSheetName(parsed.sheetName || \"OPS FEB\");
      setSheets(parsed.sheets || []);
    }
  }, []);

  const dates = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => Object.keys(row.turnos).forEach((d) => set.add(d)));
    return Array.from(set).sort();
  }, [data]);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(\"/api/parse-horarios\", {
        method: \"POST\",
        body: formData
      });

      if (!response.ok) {
        const info = await response.json();
        throw new Error(info?.error || \"No se pudo parsear el Excel\");
      }

      const payload = (await response.json()) as ApiResponse;
      setData(payload.data || []);
      setSheetName(payload.sheetName);
      setSheets(payload.sheets || []);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : \"Error desconocido\");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: \"json\" | \"csv\") => {
    if (data.length === 0) return;
    if (type === \"json\") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: \"application/json\" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement(\"a\");
      link.href = url;
      link.download = \"horarios.json\";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const headers = [\"Subcargo\", \"Nombre\", ...dates];
    const rows = data.map((row) => {
      return [
        row.subcargo,
        row.nombre,
        ...dates.map((date) => row.turnos[date] || \"\")
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `\"${String(v).replace(/\"/g, '\"\"')}\"`).join(\",\")).join(\"\\n\");
    const blob = new Blob([csv], { type: \"text/csv\" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement(\"a\");
    link.href = url;
    link.download = \"horarios.csv\";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className=\"mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10\">
      <section className=\"rounded-3xl bg-white p-6 shadow-sm\">
        <div className=\"flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between\">
          <div>
            <h1 className=\"text-2xl font-bold text-slate-900\">Mis Horarios Feb 2026</h1>
            <p className=\"text-sm text-slate-500\">
              Sube tu Excel y visualiza turnos por persona y subcargo.
            </p>
          </div>
          <div className=\"flex flex-col gap-2 sm:flex-row\">
            <button
              type=\"button\"
              onClick={() => handleExport(\"json\")}
              className=\"rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400\"
            >
              Exportar JSON
            </button>
            <button
              type=\"button\"
              onClick={() => handleExport(\"csv\")}
              className=\"rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400\"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        <form onSubmit={handleUpload} className=\"mt-6 flex flex-col gap-4 sm:flex-row sm:items-center\">
          <input
            name=\"file\"
            type=\"file\"
            accept=\".xlsx\"\n            required
            className=\"w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600\"
          />
          <button
            type=\"submit\"
            disabled={loading}
            className=\"rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60\"
          >
            {loading ? \"Cargando...\" : \"Cargar Horarios\"}
          </button>
          {loading && (
            <div className=\"text-xs text-slate-400\">Procesando Excel, por favor espera...</div>
          )}
        </form>

        {error && (
          <div className=\"mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700\">
            {error}
          </div>
        )}

        {sheets.length > 0 && (
          <div className=\"mt-4 flex items-center gap-3 text-sm text-slate-600\">
            <span>Sheet:</span>
            <select
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className=\"rounded-lg border border-slate-200 px-2 py-1 text-sm\"
              disabled={sheets.length <= 1}
            >
              {sheets.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {data.length > 0 ? (
        <HorarioTable data={data} />
      ) : (
        <div className=\"rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500\">
          Sube un Excel para visualizar los turnos.
        </div>
      )}
    </main>
  );
}

