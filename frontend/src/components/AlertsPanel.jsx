import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Bell, Info } from 'lucide-react';

export default function AlertsPanel({ alerts, thresholds }) {
  const formatTime = (isoString) => {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'HIGH_TEMP':
        return { label: 'High Temperature', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      case 'LOW_TEMP':
        return { label: 'Low Temperature', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      case 'HIGH_HUMIDITY':
        return { label: 'High Humidity', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'LOW_HUMIDITY':
        return { label: 'Low Humidity', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      default:
        return { label: type, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Threshold Alerts</h3>
            <p className="text-[11px] text-slate-400">Automatic anomaly detection log</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-mono">
          {alerts?.length || 0} total
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="mt-4 flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-2.5">
        {!alerts || alerts.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400/60 mb-2" />
            <p className="text-xs font-semibold text-slate-300">No Alerts Recorded</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              All environmental readings are currently within normal baseline thresholds.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const badge = getTypeBadge(alert.alert_type);
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all ${
                  alert.is_active
                    ? isCritical
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {alert.is_active ? (
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                    ) : (
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    alert.is_active
                      ? isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {alert.is_active ? 'Active' : 'Resolved'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 mt-2 font-medium">
                  {alert.message}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">
                    Val: <b className="text-slate-200">{alert.actual_value}</b> / Limit: <b className="text-slate-300">{alert.threshold_value}</b>
                  </span>
                  <span>{formatTime(alert.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Threshold Information Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <b>Note:</b> High Temp (&gt;{thresholds?.temp_high ?? 35}°C), Low Temp (&lt;{thresholds?.temp_low ?? 15}°C), High Humidity (&gt;{thresholds?.humidity_high ?? 80}%), Low Humidity (&lt;{thresholds?.humidity_low ?? 30}%).
        </span>
      </div>

    </div>
  );
}
