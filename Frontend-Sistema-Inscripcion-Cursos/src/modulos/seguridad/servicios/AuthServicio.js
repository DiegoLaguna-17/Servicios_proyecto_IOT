import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export default {
  login(correo, password) {
    return axios.post(`${API_URL}/login`, {
      correo,
      password
    });
  },

  verificarToken(token) {
    return axios.get(`${API_URL}/verificar-token`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  obtenerPermisos() {
    return axios.get(`${API_URL}/permisos`);
  },

  logout() {
    return axios.post(`${API_URL}/logout`);
  }
};