import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Expected response: { token, user: { id, name, email } }
  },

  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data; // Expected response: { message: "User Registered Successfully" }
  },
};

export default authService;
