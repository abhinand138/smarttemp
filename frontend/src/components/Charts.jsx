import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';
import { TrendingUp, Layers, Thermometer, Droplets } from 'lucide-react';

export default function Charts({ readings, thresholds }) {
  const [activeTab, setActiveTab] = useState('combined'); // 'combined', 'temp', 'humidity'

  // Format data for Recharts
  const chartData = (readings || []).map((item) => {
    const dateObj = new Date(item.timestamp);
    return {
      id: item.id,
      timestamp: item.timestamp,
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: dateObj.toLocaleString(),
      temperature: item.temperature,
      humidity: item.humidity,
    };
  });

  const tempHigh = thresholds?.temp_high ?? 35;
  const tempLow = thresholds?.temp_low ?? 15;
  const humHigh = thresholds?.humidity_high ?? 80;
  const humLow = thresholds?.humidity_low ?? 30;

  // Custom rich tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-slate-300 mb-2 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>{data.fullTime}</span>
            <span className="text-[10px] text-cyan-400">ID #{data.id}</span>
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-orange-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Temperature:
              </span>
              <span className="font-bold text-white text-sm">{data.temperature}°C</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Humidity:
              </span>
              <span className="font-bold text-white text-sm">{data.humidity}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-200">No Environmental Data Available</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Sensor readings collected today will automatically graph in real time once received from the ESP32 node.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Environmental Trends (Today)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological DHT11 time-series data with threshold alert limit indicators
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('combined')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'combined'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual Axis</span>
          </button>
          <button
            onClick={() => setActiveTab('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'temp'
                ? 'bg-orange-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>
          <button
            onClick={() => setActiveTab('humidity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'humidity'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Humidity</span>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'combined' ? (
            /* DUAL AXIS LINE CHART */
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                yAxisId="tempAxis"
                stroke="#fb923c"
                domain={['auto', 'auto']}
                tick={{ fill: '#fb923c', fontSize: 11 }}
                unit="°C"
              />
              <YAxis
                yAxisId="humAxis"
                orientation="right"
                stroke="#22d3ee"
                domain={[0, 100]}
                tick={{ fill: '#22d3ee', fontSize: 11 }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

              {/* Threshold indicator lines */}
              <ReferenceLine yAxisId="tempAxis" y={tempHigh} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `Temp Max ${tempHigh}°C`, fill: '#f43f5e', fontSize: 10 }} />
              <ReferenceLine yAxisId="humAxis" y={humHigh} stroke="#a855f7" strokeDasharray="4 4" label={{ value: `Hum Max ${humHigh}%`, fill: '#a855f7', fontSize: 10 }} />

              <Line
                yAxisId="tempAxis"
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f97316' }}
                activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                yAxisId="humAxis"
                type="monotone"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06b6d4' }}
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          ) : activeTab === 'temp' ? (
            /* TEMPERATURE AREA CHART */
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#fb923c" domain={['auto', 'auto']} tick={{ fill: '#fb923c', fontSize: 11 }} unit="°C" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={tempHigh} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `High Alert (${tempHigh}°C)`, fill: '#f43f5e', fontSize: 10 }} />
              <ReferenceLine y={tempLow} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: `Low Alert (${tempLow}°C)`, fill: '#38bdf8', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#f97316"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
                activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            /* HUMIDITY AREA CHART */
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#22d3ee" domain={[0, 100]} tick={{ fill: '#22d3ee', fontSize: 11 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={humHigh} stroke="#a855f7" strokeDasharray="4 4" label={{ value: `High Hum Alert (${humHigh}%)`, fill: '#a855f7', fontSize: 10 }} />
              <ReferenceLine y={humLow} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: `Dry Alert (${humLow}%)`, fill: '#fbbf24', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#humGradient)"
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
}
