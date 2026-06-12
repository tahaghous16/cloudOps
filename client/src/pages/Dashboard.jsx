import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Server, Activity, Cpu, ShieldAlert, ArrowRight, Play, Square, Terminal as TerminalIcon } from 'lucide-react';

export default function Dashboard() {
  const { servers, deployments, setSelectedServerId } = useApp();
  const navigate = useNavigate();

  // Metrics Calculations
  const totalServers = servers.length;
  const activeServers = servers.filter((s) => s.status === 'Online').length;
  const nginxRunning = servers.filter((s) => s.status === 'Online' && s.nginx === 'Running').length;
  
  const onlineServers = servers.filter((s) => s.status === 'Online');
  const avgCpu = onlineServers.length > 0
    ? Math.round(onlineServers.reduce((sum, s) => sum + s.cpu, 0) / onlineServers.length)
    : 0;

  // Mock Console Logs
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Generate initial logs
    const initialLogs = [
      { id: 1, time: '23:50:12', type: 'info', msg: 'System check completed. All AWS structures nominal.' },
      { id: 2, time: '23:51:04', type: 'success', msg: 'Connected to AWS region us-east-1 successfully.' },
      { id: 3, time: '23:52:15', type: 'warning', msg: 'Nginx process stopped on server aws-prod-db-01.' },
      { id: 4, time: '23:53:01', type: 'info', msg: 'Auto-scaling policy evaluated: no actions needed.' },
    ];
    setLogs(initialLogs);

    // Keep adding simulated logs dynamically
    const interval = setInterval(() => {
      const activeServList = servers.filter(s => s.status === 'Online');
      if (activeServList.length === 0) return;

      const randomServer = activeServList[Math.floor(Math.random() * activeServList.length)];
      const logTypes = ['info', 'success', 'warning'];
      const chosenType = logTypes[Math.floor(Math.random() * logTypes.length)];
      
      let msg = '';
      if (chosenType === 'info') {
        msg = `Metrics polled for ${randomServer.name}: CPU=${randomServer.cpu}%, RAM=${randomServer.memory}%`;
      } else if (chosenType === 'success') {
        msg = `Backup cron completed for ${randomServer.name} in 12.4ms.`;
      } else {
        const threshold = randomServer.cpu > 70 ? 'exceeded 70%' : 'fluctuating';
        msg = `CPU threshold alert for ${randomServer.name}: load is ${threshold}.`;
      }

      const timeString = new Date().toTimeString().split(' ')[0];
      setLogs((prev) => [
        { id: Date.now(), time: timeString, type: chosenType, msg },
        ...prev.slice(0, 14) // keep last 15 logs
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, [servers]);

  const stats = [
    {
      title: 'Total Servers',
      value: totalServers,
      icon: Server,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Active Servers',
      value: activeServers,
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Nginx Running',
      value: nginxRunning,
      icon: Play,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Average CPU Usage',
      value: `${avgCpu}%`,
      icon: Cpu,
      color: avgCpu > 70 ? 'text-amber-500' : 'text-sky-400',
      bgColor: avgCpu > 70 ? 'bg-amber-500/10' : 'bg-sky-500/10',
      borderColor: avgCpu > 70 ? 'border-amber-500/20' : 'border-sky-500/20',
    },
  ];

  return (
    <div className="space-y-6.5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time status of your AWS EC2 cluster.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-slate-900 border ${stat.borderColor} rounded-xl p-5 shadow-lg relative overflow-hidden`}
            >
              {/* Decorative accent dot */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2.5xl font-bold text-slate-100 mt-2.5 font-mono leading-none">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.bgColor} ${stat.color}`}>
                  <Icon className="w-5.5 h-5.5 stroke-[2]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6.5">
        {/* Servers status overview (left 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-5 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Live Instance Monitored</h2>
              <p className="text-xs text-slate-400 mt-0.5">Quick summary of running processes.</p>
            </div>
            <button
              onClick={() => navigate('/servers')}
              className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer hover:underline"
            >
              Manage Servers
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick servers list */}
          <div className="flex-1 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {servers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No servers configured. Add one from the Servers page.
              </div>
            ) : (
              servers.map((server) => (
                <div
                  key={server.id}
                  onClick={() => {
                    setSelectedServerId(server.id);
                    navigate('/monitoring');
                  }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/60 border border-slate-800/60 rounded-lg hover:border-slate-700/65 cursor-pointer hover:bg-slate-950/95"
                >
                  <div className="flex items-center gap-3">
                    {/* Status Dot */}
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        server.status === 'Online' ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        server.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}></span>
                    </span>
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{server.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{server.ip}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6.5 mt-3 sm:mt-0 border-t border-slate-900/50 sm:border-0 pt-2.5 sm:pt-0">
                    {/* Environment Badge */}
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      server.env === 'Production' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      server.env === 'Staging' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}>
                      {server.env}
                    </span>

                    {/* Quick Stats Bars */}
                    {server.status === 'Online' ? (
                      <div className="flex gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">CPU</p>
                          <p className="text-xs font-mono text-slate-300 font-semibold">{server.cpu}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">RAM</p>
                          <p className="text-xs font-mono text-slate-300 font-semibold">{server.memory}%</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">NGINX</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            server.nginx === 'Running' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950/70 text-red-400'
                          }`}>
                            {server.nginx === 'Running' ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold italic">System Unreachable</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Logs Terminal (right 1 col) */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl flex flex-col h-[480px]">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800/80 pb-4">
            <TerminalIcon className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Event Log Console</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live events from EC2 telemetry.</p>
            </div>
          </div>

          {/* Terminal Screen */}
          <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-y-auto space-y-2.5 select-none">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span className={`font-bold uppercase shrink-0 ${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warning' ? 'text-rose-500' :
                  'text-sky-400'
                }`}>
                  {log.type === 'warning' ? 'WARN' : log.type.toUpperCase()}:
                </span>
                <span className="text-slate-300 break-all">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
