import React from 'react';
import { Database, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function ReadingsTable({
  readings,
  page,
  total,
  totalPages,
  onPageChange,
  loading
}) {
  const formatTime = (isoString) => {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Sensor Reading Records</h3>
            <p className="text-[11px] text-slate-400">PostgreSQL historical database telemetry</p>
          </div>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{readings?.length || 0}</span> of <span className="font-semibold text-slate-200">{total || 0}</span> records
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Device Node</th>
              <th className="py-2.5 px-3">Temperature</th>
              <th className="py-2.5 px-3">Humidity</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {!readings || readings.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 font-sans">
                  No readings recorded yet.
                </td>
              </tr>
            ) : (
              readings.map((r) => {
                const isHot = r.temperature > 35;
                const isCold = r.temperature < 15;
                const isHumid = r.humidity > 80;
                const isDry = r.humidity < 30;
                const hasAnomaly = isHot || isCold || isHumid || isDry;

                return (
                  <tr key={r.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-2.5 px-3 text-slate-400">#{r.id}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatTime(r.timestamp)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300">
                        {r.device_id}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-semibold ${isHot ? 'text-rose-400 font-bold' : isCold ? 'text-blue-400' : 'text-slate-200'}`}>
                        {r.temperature.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-semibold ${isHumid ? 'text-purple-400' : isDry ? 'text-amber-400' : 'text-cyan-300'}`}>
                        {r.humidity.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {hasAnomaly ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          Threshold Alert
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <span className="text-xs text-slate-400">
          Page <b className="text-slate-200">{page}</b> of <b className="text-slate-200">{totalPages || 1}</b>
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
