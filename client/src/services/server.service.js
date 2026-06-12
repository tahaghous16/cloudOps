import api from './api';

export const serverService = {
  getServers: async () => {
    const response = await api.get('/servers');
    return response.data; // Expected response: Array of server objects from DB
  },

  createServer: async (serverData) => {
    // serverData should be: { name, publicIp, environment }
    const response = await api.post('/servers', serverData);
    return response.data; // Expected response: created server object
  },

  deleteServer: async (id) => {
    const response = await api.delete(`/servers/${id}`);
    return response.data; // Expected response: { message: "Server deleted successfully" }
  },

  getServerMetrics: async (id) => {
    const response = await api.get(`/servers/${id}/metrics`);
    return response.data; // Expected response: metric object returned by exporter
  },
};

export default serverService;
