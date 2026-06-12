import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import serverService from '../services/server.service';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Persistence on page refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cloudops_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [servers, setServers] = useState([]);
  const [deployments, setDeployments] = useState([
    {
      id: 'dep-1',
      projectName: 'cloudops-frontend',
      version: 'v1.2.4',
      date: '2026-06-12 14:30',
      status: 'Success'
    },
    {
      id: 'dep-2',
      projectName: 'auth-service',
      version: 'v2.0.1',
      date: '2026-06-11 09:15',
      status: 'Failed'
    },
    {
      id: 'dep-3',
      projectName: 'payment-gateway',
      version: 'v1.0.8',
      date: '2026-06-10 18:45',
      status: 'Success'
    }
  ]);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [loadingServers, setLoadingServers] = useState(false);

  // Helper: Map backend server model to frontend properties
  const mapServerData = (backendServer) => ({
    id: backendServer._id,
    name: backendServer.name,
    ip: backendServer.publicIp,
    env: backendServer.environment,
    status: 'Online', // Default status, will be refined in metrics view
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: 'N/A',
    nginx: 'Stopped'
  });

  // Fetch servers from backend
  const fetchServers = async () => {
    if (!localStorage.getItem('cloudops_token')) return;
    setLoadingServers(true);
    try {
      const data = await serverService.getServers();
      const mapped = data.map(mapServerData);
      setServers(mapped);
      if (mapped.length > 0 && !selectedServerId) {
        setSelectedServerId(mapped[0].id);
      }
    } catch (err) {
      console.error('Error fetching servers:', err);
    } finally {
      setLoadingServers(false);
    }
  };

  // Fetch servers if user is logged in on mount
  useEffect(() => {
    if (user) {
      fetchServers();
    }
  }, [user]);

  // Authentication Actions
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      // data: { token, user: { id, name, email } }
      localStorage.setItem('cloudops_token', data.token);
      localStorage.setItem('cloudops_user', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  const register = async (fullName, email, password) => {
    try {
      // 1. Call Register
      await authService.register(fullName, email, password);
      // 2. Automatically log them in for a better UX
      await login(email, password);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('cloudops_token');
    localStorage.removeItem('cloudops_user');
    setUser(null);
    setServers([]);
    setSelectedServerId(null);
  };

  const updateProfile = (name, email) => {
    if (user) {
      const updatedUser = { ...user, name, email };
      localStorage.setItem('cloudops_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.warn('Profile updated locally. Backend profile editing routes are not yet available.');
    }
  };

  // Server Actions
  const addServer = async (serverData) => {
    try {
      // serverData format on page: { name, ip, env }
      // Backend expects: { name, publicIp, environment }
      const payload = {
        name: serverData.name,
        publicIp: serverData.ip,
        environment: serverData.env
      };

      const newDbServer = await serverService.createServer(payload);
      const mapped = mapServerData(newDbServer);
      setServers((prev) => [...prev, mapped]);
      if (!selectedServerId) {
        setSelectedServerId(mapped.id);
      }
      return mapped;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create server.');
    }
  };

  const deleteServer = async (id) => {
    try {
      await serverService.deleteServer(id);
      setServers((prev) => prev.filter((s) => s.id !== id));
      if (selectedServerId === id) {
        const remaining = servers.filter((s) => s.id !== id);
        setSelectedServerId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete server.');
    }
  };

  // Nginx toggle is simulation/UI only since there is no backend API endpoint for service control
  const toggleNginx = (id) => {
    setServers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, nginx: s.nginx === 'Running' ? 'Stopped' : 'Running' } : s
      )
    );
    console.warn('Nginx state changed in UI. Real-time Nginx toggle endpoints do not exist on the backend.');
  };

  // Deployment Actions are simulation/UI only since there is no backend API endpoint for pipeline deployment
  const addMockDeployment = (projectName, version) => {
    const newDep = {
      id: `dep-${Date.now()}`,
      projectName,
      version,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending'
    };

    setDeployments((prev) => [newDep, ...prev]);

    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === newDep.id
            ? { ...d, status: Math.random() > 0.15 ? 'Success' : 'Failed' }
            : d
        )
      );
    }, 5000);
    console.warn('Deployment triggered in UI. Backend deployment pipeline routes are not yet available.');
  };

  const selectedServer = servers.find((s) => s.id === selectedServerId) || null;

  return (
    <AppContext.Provider
      value={{
        user,
        servers,
        deployments,
        selectedServerId,
        selectedServer,
        setSelectedServerId,
        loadingServers,
        fetchServers,
        login,
        register,
        logout,
        updateProfile,
        addServer,
        deleteServer,
        toggleNginx,
        addMockDeployment
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
