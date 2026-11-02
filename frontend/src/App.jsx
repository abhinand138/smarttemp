import React, { useState, useEffect, useCallback, useRef } from 'react';
import SmartTempAPI from './services/api';
import Navbar from './components/Navbar';
import StatCards from './components/StatCard';
import Charts from './components/Charts';
import AlertsPanel from './components/AlertsPanel';
import ReadingsTable from './components/ReadingsTable';
import SimulateModal from './components/SimulateModal';
import { AlertCircle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function App() {
  // State variables
  const [backendStatus, setBackendStatus] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [todayReadings, setTodayReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [historicalData, setHistoricalData] = useState({ readings: [], total: 0, totalPages: 1 });
  const [historyPage, setHistoryPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(2000); // 2s realtime polling

  const timerRef = useRef(null);

  // Fetch all primary metrics
  const fetchDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      // 1. Health status
      const statusRes = await SmartTempAPI.getStatus().catch(() => null);
      setBackendStatus(statusRes);

      // 2. Latest reading
      const latestRes = await SmartTempAPI.getLatestReading().catch(() => null);
      if (latestRes?.success) setLatestReading(latestRes.reading);

      // 3. Today's chronological readings for charts
      const todayRes = await SmartTempAPI.getTodayReadings().catch(() => null);
      if (todayRes?.success) setTodayReadings(todayRes.readings);

      // 4. Today's stats (min, max, avg)
      const statsRes = await SmartTempAPI.getStats().catch(() => null);
      if (statsRes?.success) setStats(statsRes);

      // 5. Recent alerts
      const alertsRes = await SmartTempAPI.getAlerts(20).catch(() => null);
      if (alertsRes?.success) setAlerts(alertsRes.alerts);

      // 6. Historical paginated records
      const histRes = await SmartTempAPI.getHistoricalReadings(historyPage, 10).catch(() => null);
      if (histRes?.success) {
        setHistoricalData({
          readings: histRes.readings,
          total: histRes.total,
          totalPages: histRes.total_pages,
        });
      }

      setLastUpdated(new Date());
      setErrorMsg(null);
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
      setErrorMsg('Unable to connect to Flask backend. Please ensure the backend server is running on http://127.0.0.1:5000.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [historyPage]);

  // Initial load
  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Polling timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (autoRefreshInterval > 0) {
      timerRef.current = setInterval(() => {
        fetchDashboardData(false);
      }, autoRefreshInterval);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefreshInterval, fetchDashboardData]);

  // Handle page changes in historical table
  const handlePageChange = (newPage) => {
    setHistoryPage(newPage);
  };

  // Derived threshold values (defaults)
  const thresholds = {
    temp_high: 35.0,
    temp_low: 15.0,
    humidity_high: 80.0,
    humidity_low: 30.0,
  };

  const activeAlerts = alerts.filter((a) => a.is_active);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      
      {/* 1. Header Navigation */}
      <Navbar
        backendOnline={backendStatus?.status === 'online'}
        databaseOnline={backendStatus?.database === 'connected'}
        activeAlertCount={activeAlerts.length}
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
        onRefresh={() => fetchDashboardData(false)}
        loading={loading}
        lastUpdated={lastUpdated}
        onOpenSimulate={() => setIsSimulateOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Backend Offline Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-rose-200">Backend Communication Notice</p>
                <p className="text-[11px] text-rose-300/80">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-xs transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Active Alert Banner if any alert is active */}
        {activeAlerts.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between shadow-glow-rose">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">
                  Active Environmental Warning ({activeAlerts.length})
                </p>
                <p className="text-rose-300 text-[11px] mt-0.5">
                  {activeAlerts[0]?.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSimulateOpen(true)}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 transition"
            >
              Inspect Telemetry
            </button>
          </div>
        )}

        {/* 3. Metric Cards (Temperature, Humidity, Device Status) */}
        <StatCards
          latestReading={latestReading}
          stats={stats}
          thresholds={thresholds}
        />

        {/* 4. Graphical Trends & Alerts Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Charts (8 cols) */}
          <div className="lg:col-span-8">
            <Charts
              readings={todayReadings}
              thresholds={thresholds}
            />
          </div>

          {/* Alerts Feed (4 cols) */}
          <div className="lg:col-span-4">
            <AlertsPanel
              alerts={alerts}
              thresholds={thresholds}
            />
          </div>

        </div>

        {/* 5. Historical Telemetry Database Records */}
        <ReadingsTable
          readings={historicalData.readings}
          page={historyPage}
          total={historicalData.total}
          totalPages={historicalData.totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />

      </main>

      {/* 6. Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SmartTemp</span>
            <span>•</span>
            <span>MCA Mini-Project</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">ESP32 38-Pin</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">DHT11 Sensor</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-400">Python Flask 3.1</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-400">PostgreSQL 18</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400">React + Vite + Tailwind</span>
          </div>

          <div>
            <span>Status: </span>
            <span className="text-emerald-400 font-medium">Production Ready</span>
          </div>
        </div>
      </footer>

      {/* 7. Interactive Test Simulator Modal */}
      <SimulateModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSuccess={() => fetchDashboardData(false)}
      />

    </div>
  );
}
