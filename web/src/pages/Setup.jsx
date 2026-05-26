import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSite, addDevice } from '../services/api';
import { Home, Gauge, Sun, CheckCircle } from 'lucide-react';

const steps = [
  { icon: Home, title: 'Create Site', desc: 'Add your property' },
  { icon: Gauge, title: 'Emporia Vue', desc: 'Connect consumption monitor' },
  { icon: Sun, title: 'SMA Inverter', desc: 'Connect solar inverter' },
  { icon: CheckCircle, title: 'Complete', desc: 'Ready to go!' },
];

export default function Setup() {
  const [step, setStep] = useState(0);
  const [siteName, setSiteName] = useState('');
  const [siteId, setSiteId] = useState(null);
  const [emporiaToken, setEmporiaToken] = useState('');
  const [smaPlantId, setSmaPlantId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateSite = async () => {
    setLoading(true);
    try {
      const res = await createSite({ name: siteName, address: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      setSiteId(res.data.id);
      setStep(1);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleEmporia = async () => {
    if (!emporiaToken) { setStep(2); return; }
    setLoading(true);
    try {
      await addDevice({ siteId, type: 'EMPORIA_VUE', name: 'Emporia Vue', credentials: { apiToken: emporiaToken } });
      setStep(2);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSma = async () => {
    if (!smaPlantId) { setStep(3); return; }
    setLoading(true);
    try {
      await addDevice({ siteId, type: 'SMA_INVERTER', name: 'SMA Sunny Boy', credentials: { plantId: smaPlantId } });
      setStep(3);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= step ? 'bg-energy-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-energy-500' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-1">{steps[step].title}</h2>
          <p className="text-gray-400 text-sm mb-6">{steps[step].desc}</p>

          {step === 0 && (
            <div className="space-y-4">
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="input-field" placeholder="Site name (e.g. My Home)" />
              <button onClick={handleCreateSite} disabled={!siteName || loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Creating...' : 'Create Site'}</button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <input value={emporiaToken} onChange={(e) => setEmporiaToken(e.target.value)} className="input-field" placeholder="Emporia API token (optional)" />
              <div className="flex gap-3">
                <button onClick={handleEmporia} className="btn-primary flex-1">{emporiaToken ? 'Connect' : 'Skip'}</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <input value={smaPlantId} onChange={(e) => setSmaPlantId(e.target.value)} className="input-field" placeholder="SMA Plant ID (optional)" />
              <button onClick={handleSma} className="btn-primary w-full">{smaPlantId ? 'Connect' : 'Skip'}</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-lg font-medium">You're all set!</p>
              <button onClick={() => navigate('/')} className="btn-primary">Go to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
