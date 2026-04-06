import React, { useState, useEffect } from 'react';
import { Copy, Ticket, Check, Loader2, Users, Trash2, RefreshCw } from 'lucide-react';
// CORRECCIÓN: Solo 2 niveles hacia atrás: ../../
import api from '../../api/axios'; 

const GroupCodeGenerator = () => {
  const [groupName, setGroupName] = useState('');
  const [activeCodes, setActiveCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchCodes = async () => {
    setFetching(true);
    try {
      const response = await api.get('/groups/list');
      const data = response.data.data || response.data;
      setActiveCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener códigos");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleGenerate = async () => {
    if (!groupName) return;
    setLoading(true);
    try {
      await api.post('/groups/generate', { sector: groupName });
      setGroupName('');
      fetchCodes();
    } catch (error) { alert("Error al generar código."); }
    finally { setLoading(false); }
  };

  const copyToClipboard = (code: string, id: any) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Ticket className="text-blue-600" size={24} /> Generar Código de Sector
        </h3>
        <div className="flex gap-4">
          <input 
            type="text" placeholder="Ej: Mantenimiento, Sistemas..." className="flex-grow p-4 bg-gray-50 border rounded-2xl outline-none"
            value={groupName} onChange={(e) => setGroupName(e.target.value)}
          />
          <button onClick={handleGenerate} disabled={loading || !groupName} className="bg-gray-900 text-white px-8 rounded-2xl font-black">
            {loading ? <Loader2 className="animate-spin" /> : 'ACTIVAR'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeCodes.map((item: any) => (
          <div key={item.id} className="p-5 bg-white border rounded-[1.5rem] flex items-center justify-between shadow-sm group hover:border-blue-200 transition-all">
            <div className="space-y-1">
              <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">{item.sector}</span>
              <p className="text-xl font-black text-gray-800 font-mono tracking-tighter uppercase">{item.code}</p>
            </div>
            <button onClick={() => copyToClipboard(item.code, item.id)} className="p-3 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-50">
              {copiedId === item.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupCodeGenerator;