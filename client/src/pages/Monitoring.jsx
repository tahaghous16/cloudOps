import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import serverService from '../services/server.service';
import { Play, Square, Cpu, HardDrive, ShieldCheck, AlertCircle, Clock, Server, Power, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Monitoring() {
  const { servers, selectedServer, setSelectedServerId, toggleNginx } = useApp();

  const currentServer = selectedServer || servers[0];

  // Metrics State
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState('');
  
  // CPU usage history for chart
  const [cpuHistory, setCpuHistory] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  // Fetch metrics helper
  const loadMetrics = async (showLoading = false) => {
    if (!currentServer) return;
    if (showLoading) setLoadingMetrics(true);
    
    try {
      const data = await serverService.getServerMetrics(currentServer.id);
      setMetrics(data);
      setMetricsError('');
      setCpuHistory((prev) => {
        const nextVal = data.cpu !== undefined ? Number(data.cpu) : 0;
        return [...prev.slice(1), nextVal];
      });
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setMetrics(null);
      setMetricsError(
        `Metrics agent unreachable at http://${currentServer.ip}:8000/metrics. Verify that port 8000 is open in your AWS security groups and the exporter service is running.`
      );
      setCpuHistory((prev) => [...prev.slice(1), 0]);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Poll metrics on mount or selected server change
  useEffect(() => {
    setCpuHistory([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setMetrics(null);
    setMetricsError('');
    
    if (!currentServer) return;

    loadMetrics(true);

    const interval = setInterval(() => {
      loadMetrics(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentServer?.id]);

  // Helpers for progress bar colors
  const getProgressColor = (value) => {
    if (value < 60) return 'from-sky-400 to-cyan-400';
    if (value < 85) return 'from-amber-400 to-orange-400';
    return 'from-rose-500 to-red-500';
  };

  if (servers.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center py-16">
        <Server className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white">No Instances Monitored</h2>
        <p className="text-sm text-slate-400 mt-2">Add a server on the Servers page to start monitoring.</p>
      </div>
    );
  }

  // Active server telemetry metrics or default zeroed values
  const cpuVal = metrics?.cpu !== undefined ? Number(metrics.cpu) : 0;
  const memVal = metrics?.memory !== undefined ? Number(metrics.memory) : 0;
  const diskVal = metrics?.disk !== undefined ? Number(metrics.disk) : 0;
  const uptimeVal = metrics?.uptime || 'N/A';
  const nginxStatus = metrics?.nginx || 'Stopped';

  return (
    <div className="space-y-6.5">
      {/* Page Header with Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Metrics & Monitoring</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time health telemetry and resource telemetry.</p>
        </div>

        {/* Selector Dropdown */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 p-2.5 rounded-lg">
          {loadingMetrics && (
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
          )}
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1.5 hidden sm:inline">
            Select Instance:
          </span>
          <select
            value={currentServer.id}
            onChange={(e) => setSelectedServerId(e.target.value)}
            className="bg-slate-955 border border-slate-800 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-sky-500 text-slate-200"
          >
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.ip})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Error Alert Banner */}
      {metricsError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm leading-relaxed">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Metric Agent Error</p>
            <p className="text-xs text-red-400/90 mt-1">{metricsError}</p>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="space-y-6.5">
        {/* Metrics Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {/* CPU Metric Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>CPU Usage</span>
                <Cpu className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white font-mono leading-none">{cpuVal}</span>
                <span className="text-sm text-slate-400 font-mono">%</span>
              </div>
            </div>
            
            <div className="mt-6.5">
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${cpuVal}%` }}
                  className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${getProgressColor(cpuVal)}`}
                ></div>
              </div>
            </div>
          </div>

          {/* Memory Metric Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Memory Usage</span>
                <HardDrive className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white font-mono leading-none">{memVal}</span>
                <span className="text-sm text-slate-400 font-mono">%</span>
              </div>
            </div>

            <div className="mt-6.5">
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${memVal}%` }}
                  className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${getProgressColor(memVal)}`}
                ></div>
              </div>
            </div>
          </div>

          {/* Disk Metric Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Disk Usage</span>
                <HardDrive className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white font-mono leading-none">{diskVal}</span>
                <span className="text-sm text-slate-400 font-mono">%</span>
              </div>
            </div>

            <div className="mt-6.5">
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${diskVal}%` }}
                  className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${getProgressColor(diskVal)}`}
                ></div>
              </div>
            </div>
          </div>

          {/* Uptime Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>System Uptime</span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-5">
                <span className="text-xl font-bold text-white font-mono leading-none">{uptimeVal}</span>
              </div>
            </div>

            <div className="mt-6 pt-3.5 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
              IP: {currentServer.ip}
            </div>
          </div>

          {/* Nginx Status Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Nginx Status</span>
                <ShieldCheck className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-4">
                {nginxStatus === 'Running' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 glow-active"></span>
                    Running
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Stopped
                  </span>
                )}
              </div>
            </div>

            {/* Nginx Toggle Switch Action (Local UI state warning) */}
            <div className="mt-6 flex justify-between items-center border-t border-slate-850 pt-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase" title="Local Preview Mode">Toggle Process</span>
              <button
                onClick={() => toggleNginx(currentServer.id)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none ${
                  currentServer.nginx === 'Running' ? 'bg-emerald-550' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                    currentServer.nginx === 'Running' ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Graph View */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">CPU Load History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time charts sampled at 5-second intervals.</p>
            </div>

            {/* Telemetry metadata */}
            <div className="flex gap-4.5 mt-3 sm:mt-0 font-mono text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-gradient-to-tr from-sky-400 to-cyan-400 rounded-sm"></span>
                <span className="text-slate-400">Current Load: {cpuVal}%</span>
              </div>
              <div className="text-slate-500">ENVIRONMENT: {currentServer.env}</div>
            </div>
          </div>

          {/* Sparkline Bar Chart using Tailwind CSS grids */}
          <div className="h-56 flex items-end gap-2 px-2 border-b border-l border-slate-800/80 pb-1.5 select-none">
            {cpuHistory.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip */}
                <span className="absolute -top-6 bg-slate-950 border border-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {val}%
                </span>
                
                {/* Bar */}
                <div
                  style={{ height: `${val || 4}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 bg-gradient-to-t ${getProgressColor(val)}`}
                ></div>
                
                {/* index labels */}
                <span className="absolute -bottom-5.5 text-[9px] font-semibold font-mono text-slate-600">
                  t - {(cpuHistory.length - 1 - idx) * 5}s
                </span>
              </div>
            ))}
          </div>
          
          {/* Chart footer spacer */}
          <div className="h-4.5"></div>
        </div>
      </div>
    </div>
  );
}
