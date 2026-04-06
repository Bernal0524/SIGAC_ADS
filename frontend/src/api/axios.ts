import axios from 'axios';

const api = axios.create({
  // IMPORTANTE: Verifica si tu NestJS tiene setGlobalPrefix('api')
  // Si no lo tiene, usa solo 'http://localhost:3000'
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor de SALIDA (Request): Inyecta el Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Usamos corchetes para asegurar que TS no se queje de los headers
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor de ENTRADA (Response): Manejo de errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token expiró o es inválido, mandamos al login
      console.warn("Sesión expirada o no autorizada");
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Opcional: redirección automática
    }
    return Promise.reject(error);
  }
);

export default api;