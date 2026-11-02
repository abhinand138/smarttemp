import React from 'react';
import { Thermometer, Droplets, Clock, ArrowUp, ArrowDown, Activity, Wifi, WifiOff, AlertOctagon } from 'lucide-react';

export default function StatCards({ latestReading, stats, thresholds }) {
  // Temperature evaluation
  const temp = latestReading?.temperature;
  const hum = latestReading?.humidity;

  const getTempStatus = (val) => {
    if (val == null) return { label: 'No Data', color: 'slate' };
    if (val > (thresholds?.temp_high ?? 35)) return { label: 'High Alert', color: 'rose', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    if (val < (thresholds?.temp_low ?? 15)) return { label: 'Low / Cold', color: 'blue', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    if (val >= 30) return { label: 'Warm', color: 'amber', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { label: 'Optimal / Comfortable', color: 'emerald', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  };

  const getHumidityStatus = (val) => {
    if (val == null) return { label: 'No Data', color: 'slate' };
    if (val > (thresholds?.humidity_high ?? 80)) return { label: 'High Humidity', color: 'rose', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    if (val < (thresholds?.humidity_low ?? 30)) return { label: 'Dry / Low', color: 'amber', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { label: 'Optimal Range', color: 'cyan', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
  };

  const tempStatus = getTempStatus(temp);
  const humStatus = getHumidityStatus(hum);

  // Device status calculation: check if reading is recent (under 3 minutes)
  const isDeviceActive = latestReading?.timestamp
    ? (Date.now() - new Date(latestReading.timestamp).getTime()) < 3 * 60 * 1000
    : false;

  const formatTime = (isoString) => {
    if (!isoString) return 'Waiting for reading...';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* 1. TEMPERATURE CARD */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Temperature</h3>
              <p className="text-xs text-slate-400">DHT11 Sensor (Celsius)</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${tempStatus.badge}`}>
            {tempStatus.label}
          </span>
        </div>

        {/* Big Value Display */}
        <div className="my-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-extrabold tracking-tight text-white">
              {temp != null ? temp.toFixed(1) : '--'}
            </span>
            <span className="text-2xl font-bold text-orange-400">°C</span>
          </div>
        </div>

        {/* Min / Max / Avg Today */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ArrowDown className="w-3 h-3 text-blue-400" /> Min
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {stats?.temperature?.min != null ? `${stats.temperature.min}°C` : '--'}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <Activity className="w-3 h-3 text-emerald-400" /> Avg
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {stats?.temperature?.avg != null ? `${stats.temperature.avg}°C` : '--'}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ArrowUp className="w-3 h-3 text-rose-400" /> Max
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {stats?.temperature?.max != null ? `${stats.temperature.max}°C` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. HUMIDITY CARD */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Relative Humidity</h3>
              <p className="text-xs text-slate-400">Atmospheric Moisture</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${humStatus.badge}`}>
            {humStatus.label}
          </span>
        </div>

        {/* Big Value Display */}
        <div className="my-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-extrabold tracking-tight text-white">
              {hum != null ? hum.toFixed(1) : '--'}
            </span>
            <span className="text-2xl font-bold text-cyan-400">%</span>
          </div>
        </div>

        {/* Min / Max / Avg Today */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ArrowDown className="w-3 h-3 text-amber-400" /> Min
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {stats?.humidity?.min != null ? `${stats.humidity.min}%` : '--'}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <Activity className="w-3 h-3 text-cyan-400" /> Avg
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {stats?.humidity?.avg != null ? `${stats.humidity.avg}%` : '--'}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ArrowUp className="w-3 h-3 text-purple-400" /> Max
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {stats?.humidity?.max != null ? `${stats.humidity.max}%` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. DEVICE & HEALTH CARD */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl border ${isDeviceActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {isDeviceActive ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">ESP32 Node Status</h3>
              <p className="text-xs text-slate-400">GPIO 4 • Wi-Fi Station</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${isDeviceActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
            {isDeviceActive ? 'Transmitting' : 'Idle / Standby'}
          </span>
        </div>

        {/* Device Info Summary */}
        <div className="my-2 space-y-2">
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400">Device ID:</span>
            <span className="font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {latestReading?.device_id || 'esp32_dht11_primary'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Latest Ping:
            </span>
            <span className="text-slate-200 font-medium">
              {formatTime(latestReading?.timestamp)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400">Today's Records:</span>
            <span className="text-emerald-400 font-semibold">
              {stats?.reading_count ?? 0} data points
            </span>
          </div>
        </div>

        {/* Configured Thresholds preview */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Threshold Alerts:</span>
          <span className="text-slate-300">
            &gt;{thresholds?.temp_high ?? 35}°C | &gt;{thresholds?.humidity_high ?? 80}%
          </span>
        </div>
      </div>

    </div>
  );
}
