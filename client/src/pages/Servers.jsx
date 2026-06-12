import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Search, Trash2, Activity, Globe, Shield, Terminal, X, AlertTriangle } from 'lucide-react';

export default function Servers() {
  const { servers, addServer, deleteServer, setSelectedServerId } = useApp();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [envFilter, setEnvFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIp, setNewIp] = useState('');
  const [newEnv, setNewEnv] = useState('Production');
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filtered servers list
  const filteredServers = servers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.ip.includes(searchTerm);
    const matchesEnv = envFilter === 'All' || server.env === envFilter;
    return matchesSearch && matchesEnv;
  });

  // Handle Add Server Submit
  const handleAddServer = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newName || !newIp) {
      setFormError('All fields are required.');
      return;
    }

    // IP validation regex (simple)
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipPattern.test(newIp)) {
      setFormError('Please enter a valid IP address (e.g. 54.210.45.12).');
      return;
    }

    try {
      await addServer({
        name: newName,
        ip: newIp,
        env: newEnv
      });

      // Reset Form & Close
      setNewName('');
      setNewIp('');
      setNewEnv('Production');
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to add server.');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteServer(deleteConfirmId);
        setDeleteConfirmId(null);
      } catch (err) {
        console.error('Delete error:', err);
        alert(err.message || 'Failed to delete server.');
        setDeleteConfirmId(null);
      }
    }
  };

  return (
    <div className="space-y-6.5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EC2 Instances</h1>
          <p className="text-sm text-slate-400 mt-1">Configure and manage cloud server configurations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg shadow-sky-500/10 cursor-pointer self-start sm:self-auto text-sm"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>Add Server</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 shadow-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/80 text-sm"
          />
        </div>

        {/* Environment Filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800/60 self-start md:self-auto">
          {['All', 'Production', 'Staging', 'Development'].map((env) => (
            <button
              key={env}
              onClick={() => setEnvFilter(env)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                envFilter === env
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List of Server Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 border-dashed rounded-2xl py-16 text-center">
            <p className="text-slate-500 text-sm font-semibold">No servers match your filters.</p>
            <p className="text-xs text-slate-600 mt-1">Try updating your filters or add a new EC2 server.</p>
          </div>
        ) : (
          filteredServers.map((server) => (
            <div
              key={server.id}
              className={`bg-slate-900 border border-slate-800/80 hover:border-slate-700/85 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition-all group ${
                server.status === 'Offline' ? 'opacity-85' : ''
              }`}
            >
              {/* Top Section */}
              <div>
                <div className="flex justify-between items-start">
                  {/* Environment Label */}
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    server.env === 'Production' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    server.env === 'Staging' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  }`}>
                    {server.env}
                  </span>

                  {/* Status Indicator */}
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${
                      server.status === 'Online' ? 'bg-emerald-500 glow-active' : 'bg-slate-500'
                    }`}></span>
                    <span className="text-xs font-semibold text-slate-400">{server.status}</span>
                  </span>
                </div>

                {/* Instance Main Stats */}
                <div className="mt-4">
                  <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                    {server.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>{server.ip}</span>
                  </div>
                </div>

                {/* Uptime Detail */}
                <div className="mt-4.5 border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Uptime</span>
                  <span className="text-slate-300 font-mono">{server.uptime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3 border-t border-slate-800/80 pt-4">
                <button
                  onClick={() => {
                    setSelectedServerId(server.id);
                    navigate('/monitoring');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg cursor-pointer hover:border-slate-700"
                >
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>View Metrics</span>
                </button>
                
                <button
                  onClick={() => handleDeleteClick(server.id)}
                  className="px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"
                  title="Delete Server"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Server Modal Dialog Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Add EC2 Instance</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddServer} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  placeholder="aws-prod-web-02"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-650 focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Public IP Address
                </label>
                <input
                  type="text"
                  placeholder="54.210.45.13"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-650 focus:outline-none focus:border-sky-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Environment
                </label>
                <select
                  value={newEnv}
                  onChange={(e) => setNewEnv(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-205 focus:outline-none focus:border-sky-500 text-sm"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3.5 border-t border-slate-800/80 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-950/80 text-sm font-semibold text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg cursor-pointer text-sm"
                >
                  Save Instance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Are you sure you want to terminate this instance? This action is permanent and cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-950 hover:bg-slate-950/85 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
