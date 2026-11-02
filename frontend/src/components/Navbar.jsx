import React from 'react';
import { Thermometer, Activity, RefreshCw, AlertTriangle, Cpu, Radio, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Navbar({
  backendOnline,
  databaseOnline,
  activeAlertCount,
  autoRefreshInterval,
  setAutoRefreshInterval,
  onRefresh,
  loading,
  lastUpdated,
  onOpenSimulate
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Project Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 flex items-center justify-center shadow-glow-cyan">
            <Thermometer className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                SmartTemp
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                IoT Monitor
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Environmental Monitoring • ESP32 & PostgreSQL
            </p>
          </div>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Backend / DB Status indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${backendOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="text-slate-300 font-medium">
              API: {backendOnline ? 'Online' : 'Offline'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              DB: {databaseOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Active Alerts Pill */}
          {activeAlertCount > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{activeAlertCount} Alert{activeAlertCount > 1 ? 's' : ''}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Normal</span>
            </div>
          )}

          {/* Polling Interval Select */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 hidden sm:inline" />
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
              aria-label="Auto-refresh interval"
            >
              <option value={1000}>1s (Ultra Fast)</option>
              <option value={2000}>2s (Realtime)</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={0}>Pause</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh dashboard"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Simulate Data Modal Trigger */}
          <button
            onClick={onOpenSimulate}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold shadow-glow-cyan transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Test Sensor</span>
          </button>

        </div>
      </div>
    </header>
  );
}
