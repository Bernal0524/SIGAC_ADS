import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

/**
 * Definición de tipos para el Usuario de SIGAC
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: 'COORDINADOR' | 'COLABORADOR';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * PROVEEDOR DE AUTENTICACIÓN (AuthWrapper)
 * Envuelve a toda la aplicación para que cualquier componente sepa quién está logueado.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, recuperamos la sesión del LocalStorage
  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Error al restaurar sesión de SIGAC:", error);
          logout(); // Si los datos están corruptos, limpiamos
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Función para iniciar sesión (se llama desde Login.tsx)
   */
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  /**
   * Función para cerrar sesión (Limpia rastro y redirige)
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  /**
   * Verifica con el Backend si el token sigue siendo válido
   * Útil para cuando el usuario refresca la página (F5)
   */
  const checkAuth = async () => {
    if (!token) return;
    try {
      // Endpoint opcional en tu backend para validar perfil
      const response = await api.get('/auth/profile'); 
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      logout();
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar la autenticación en cualquier parte
 * Ejemplo: const { user, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};