import React, { useState } from 'react';
import { X, Send, Cpu, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import SmartTempAPI from '../services/api';

export default function SimulateModal({ isOpen, onClose, onSuccess }) {
  const [temperature, setTemperature] = useState('26.5');
  const [humidity, setHumidity] = useState('55.0');
  const [deviceId, setDeviceId] = useState('esp32_dht11_primary');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await SmartTempAPI.sendReading({
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        device_id: deviceId,
      });

      setStatusMsg({
        type: 'success',
        text: `Reading recorded successfully! ${res.alerts_triggered?.length ? `(Triggered ${res.alerts_triggered.length} alert)` : '(Normal values)'}`
      });

      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
      }, 1200);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to submit reading to backend.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const applyPreset = (temp, hum) => {
    setTemperature(String(temp));
    setHumidity(String(hum));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Simulate Sensor Telemetry</h3>
              <p className="text-[11px] text-slate-400">Post test DHT11 readings directly to Flask API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Test Presets:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => applyPreset(25.0, 52.0)}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-semibold text-emerald-400">Normal Range</div>
                <div className="text-[10px] text-slate-400">25.0°C • 52% Hum</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(38.5, 45.0)}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-semibold text-rose-400">High Temp Alert</div>
                <div className="text-[10px] text-slate-400">38.5°C (&gt; 35°C)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(26.0, 86.0)}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-semibold text-purple-400">High Humidity Alert</div>
                <div className="text-[10px] text-slate-400">86.0% (&gt; 80%)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(11.5, 38.0)}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-semibold text-blue-400">Low Temp Alert</div>
                <div className="text-[10px] text-slate-400">11.5°C (&lt; 15°C)</div>
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Relative Humidity (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Device Node ID
            </label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Feedback message */}
          {statusMsg && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold shadow-glow-cyan transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Transmitting...' : 'Send Reading'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
