import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpCircle, Search, Play, CheckCircle, XCircle, Clock, Plus, AlertTriangle } from 'lucide-react';

export default function Deployments() {
  const { deployments, addMockDeployment } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Trigger Deployment Form State
  const [isDeploying, setIsDeploying] = useState(false);
  const [projectSelect, setProjectSelect] = useState('cloudops-frontend');
  const [versionInput, setVersionInput] = useState('');
  const [deployError, setDeployError] = useState('');

  // Filter deployments list
  const filteredDeployments = deployments.filter((dep) => {
    const matchesSearch = dep.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || dep.version.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || dep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Deploy Trigger Submit
  const handleTriggerDeploy = (e) => {
    e.preventDefault();
    setDeployError('');

    if (!versionInput) {
      setDeployError('Please enter a release version (e.g. v1.2.5).');
      return;
    }

    // Version validation (simple prefix checks)
    const versionPattern = /^v\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
    if (!versionPattern.test(versionInput)) {
      setDeployError('Please use semver format (e.g., v1.2.5 or v2.0.0-rc1).');
      return;
    }

    addMockDeployment(projectSelect, versionInput);

    // Reset Form
    setVersionInput('');
    setIsDeploying(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Success
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6.5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deployments</h1>
          <p className="text-sm text-slate-400 mt-1">Review pipeline history and deploy code updates.</p>
        </div>
        <button
          onClick={() => setIsDeploying(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg shadow-sky-500/10 cursor-pointer self-start sm:self-auto text-sm"
        >
          <ArrowUpCircle className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>New Deployment</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl text-xs leading-relaxed">
        <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-sky-400" />
        <span>
          <strong>Backend Notice:</strong> No deployment endpoints exist in the current backend database schema. Deployments triggered below will function locally in the browser session.
        </span>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 shadow-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by project or version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-650 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800/60 self-start md:self-auto">
          {['All', 'Success', 'Failed', 'Pending'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                statusFilter === status
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/45 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Deployment Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredDeployments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-500">
                    No deployment records found.
                  </td>
                </tr>
              ) : (
                filteredDeployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-950/35 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">{dep.projectName}</td>
                    <td className="px-6 py-4 font-mono text-slate-300 text-xs">{dep.version}</td>
                    <td className="px-6 py-4 text-slate-400">{dep.date}</td>
                    <td className="px-6 py-4">{getStatusBadge(dep.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Deployment Modal */}
      {isDeploying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-sky-400" />
                Trigger Deploy Pipeline
              </h2>
              <button
                onClick={() => setIsDeploying(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleTriggerDeploy} className="p-6 space-y-4">
              {deployError && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deployError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Project / Microservice
                </label>
                <select
                  value={projectSelect}
                  onChange={(e) => setProjectSelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 text-sm"
                >
                  <option value="cloudops-frontend">cloudops-frontend</option>
                  <option value="auth-service">auth-service</option>
                  <option value="payment-gateway">payment-gateway</option>
                  <option value="notification-worker">notification-worker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Semantic Version
                </label>
                <input
                  type="text"
                  placeholder="e.g. v1.2.5"
                  value={versionInput}
                  onChange={(e) => setVersionInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-650 focus:outline-none focus:border-sky-500 text-sm font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3.5 border-t border-slate-800/80 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDeploying(false)}
                  className="px-4.5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-950/80 text-sm font-semibold text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg cursor-pointer text-sm"
                >
                  Trigger Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
