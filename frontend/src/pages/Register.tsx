import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  UserPlus, Mail, User, Loader2, AlertCircle, 
  CheckCircle2, ChevronLeft, UserCheck, KeyRound 
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '' // Este es el campo 'inviteCode' que exige el DTO
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones locales básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // PAYLOAD EXACTO SEGÚN EL DTO: name, email, password, inviteCode
      const payload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        inviteCode: formData.inviteCode.trim() // El backend lo marca como obligatorio
      };

      const response = await api.post('/auth/register', payload);

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }

    } catch (err: any) {
      const backendError = err.response?.data;
      
      // Si NestJS arroja errores de validación (class-validator)
      if (backendError?.message) {
        const msg = Array.isArray(backendError.message) 
          ? backendError.message[0] 
          : backendError.message;
        setError(msg);
      } else {
        setError('Error al registrar. Verifica el código de invitación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <UserPlus className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Registro SIGAC</h1>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 mb-1 uppercase">
                <AlertCircle size={14}/> <span>Error del Sistema</span>
              </div>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-green-100 rounded-2xl text-green-600 text-sm font-bold flex gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p>¡Cuenta creada! Redirigiendo...</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Nombre Completo"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="usuario@sigac.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-blue-600 font-medium"
              />
            </div>

            {/* CÓDIGO DE INVITACIÓN - CRÍTICO PARA EL DTO */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Código de Invitación</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  name="inviteCode"
                  type="text"
                  required
                  placeholder="Introduce tu código"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-blue-50 border border-blue-200 rounded-2xl outline-none focus:border-blue-600 font-bold text-blue-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clave</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-blue-600 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>CREAR CUENTA <UserCheck size={18}/></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;