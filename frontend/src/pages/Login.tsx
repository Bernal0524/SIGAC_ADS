import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  LogIn, Mail, Lock, Loader2, AlertCircle, 
  Eye, EyeOff, CheckCircle2, ShieldCheck,
  ChevronRight, Info
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Limpiar errores automáticamente al escribir
  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

  // Verificar sesión existente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!email.includes('@')) {
      setError('Ingresa un correo institucional válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // POST coincidente con el LoginDto de Alexander
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      // NestJS suele devolver { accessToken: '...', user: {...} }
      // Ojo: Revisa si Alexander lo llamó access_token o accessToken
      const { access_token, accessToken, user } = response.data;
      const tokenToSave = access_token || accessToken;

      if (tokenToSave) {
        localStorage.setItem('token', tokenToSave);
        localStorage.setItem('user', JSON.stringify(user));
        
        setLoginSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err: any) {
      console.error("Login Error:", err.response?.data);
      
      const backendMessage = err.response?.data?.message;
      
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas. Revisa tu correo o contraseña.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Servidor SIGAC fuera de línea.');
      } else {
        setError(
          Array.isArray(backendMessage) ? backendMessage[0] : backendMessage || 'Error al intentar conectar.'
        );
      }
    } finally {
      if (!loginSuccess) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative p-4 overflow-hidden">
      {/* Círculos de fondo decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 p-10 text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">SIGAC</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Acceso Administrativo</p>
          </div>

          <div className="p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {loginSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-bold flex items-center gap-3 animate-in zoom-in-95">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <p>Acceso concedido. Entrando...</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Institucional</label>
                <div className="relative mt-1 group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@sigac.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña</label>
                  <button type="button" className="text-[10px] font-black text-blue-600 hover:underline">¿Olvido su clave?</button>
                </div>
                <div className="relative mt-1 group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || loginSuccess}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>INGRESAR <LogIn size={20}/></>}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 ml-1">Regístrate aquí</Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
          <Info size={12} />
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">Bernal & Co • Sistema de Orquestación 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Login;