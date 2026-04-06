import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  KeyRound, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldQuestion
} from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Endpoint esperado en NestJS para recuperación
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error en recuperación:", err);
      const message = err.response?.data?.message;
      setError(
        Array.isArray(message) 
          ? message[0] 
          : message || 'No pudimos procesar la solicitud en este momento.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4">
      {/* Círculos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px] relative">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          
          {/* Header con gradiente suave */}
          <div className="bg-gray-900 p-10 text-center relative">
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-md">
              <KeyRound className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Recuperar Acceso</h1>
            <p className="text-gray-400 text-sm font-medium mt-1">Ingresa tu correo institucional</p>
          </div>

          <div className="p-10">
            {!submitted ? (
              <>
                {error && (
                  <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-bold leading-tight">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo Registrado</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu-correo@sigac.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enviar Instrucciones"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-green-500 w-10 h-10" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">¡Correo Enviado!</h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                  Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña en unos minutos.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all"
                >
                  Volver al Inicio
                </button>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 text-gray-400 font-bold text-sm hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Regresar al Login
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center items-center gap-2 text-gray-400">
          <ShieldQuestion size={14} />
          <p className="text-[10px] font-black uppercase tracking-widest">Soporte Técnico SIGAC</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;