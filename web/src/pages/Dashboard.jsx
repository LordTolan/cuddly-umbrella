import { useEffect, useState } from 'react';
import { getDashboard, getAlerts } from '../services/api';
import KpiCard from '../components/KpiCard';
import { Sun, Gauge, TrendingUp, Zap, AlertTriangle, Info, XCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteId] = useState(() => localStorage.getItem('activeSiteId') || '');

  const fetchData = async () => {
    if (!siteId) { setLoading(false); return; }
    try {
      const [dashRes, alertRes] = await Promise.all([getDashboard(siteId), getAlerts(siteId)]);
      setSummary(dashRes.data);
      setAlerts(alertRes.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [siteId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-energy-500 border-t-transparent rounded-full" /></div>;

  if (!siteId) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <Zap className="w-12 h-12 mb-4 text-solar-400" />
      <p className="text-lg font-medium">No site configured</p>
      <p className="text-sm">Complete the setup wizard to get started.</p>
    </div>
  );

  const live = summary?.live || {};
  const today = summary?.today || {};
  const month = summary?.month || {};
  const exporting = live.exporting || false;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-white transition-colors"><RefreshCw className="w-5 h-5" /></button>
      </div>

      {/* Live KPIs */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Live Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Solar" value={`${(live.solarKw || 0).toFixed(1)} kW`} icon={Sun} color="text-solar-400" bgColor="bg-solar-500/10" />
          <KpiCard title="Usage" value={`${(live.consumptionWatts || 0).toFixed(0)} W`} icon={Gauge} color="text-energy-400" bgColor="bg-energy-500/10" />
          <div className={`kpi-card ${exporting ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${exporting ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <Zap className={`w-5 h-5 ${exporting ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <p className="text-sm text-gray-400">Net Grid</p>
            <p className="text-2xl font-bold">{Math.abs(live.netGridWatts || 0).toFixed(0)} W</p>
            <p className={`text-xs ${exporting ? 'text-green-400' : 'text-red-400'}`}>{exporting ? '↑ Exporting' : '↓ Importing'}</p>
          </div>
          <KpiCard title="Solar Offset" value={`${(month.solarOffsetPercent || 0).toFixed(0)}%`} subtitle="This month" icon={TrendingUp} color="text-green-400" bgColor="bg-green-500/10" />
        </div>
      </div>

      {/* Today */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard title="Generated" value={`${(today.solarKwh || 0).toFixed(1)} kWh`} icon={Sun} color="text-solar-400" bgColor="bg-solar-500/10" />
          <KpiCard title="Consumed" value={`${(today.consumptionKwh || 0).toFixed(1)} kWh`} icon={Gauge} color="text-energy-400" bgColor="bg-energy-500/10" />
        </div>
      </div>

      {/* Monthly */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">This Month</h2>
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400">Solar Offset</span>
            <span className="text-green-400 font-bold">{(month.solarOffsetPercent || 0).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
            <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(month.solarOffsetPercent || 0, 100)}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-gray-500">Generated</p><p className="font-medium">{(month.solarKwh || 0).toFixed(0)} kWh</p></div>
            <div><p className="text-gray-500">Consumed</p><p className="font-medium">{(month.consumptionKwh || 0).toFixed(0)} kWh</p></div>
            <div><p className="text-gray-500">Net Utility</p><p className="font-medium">{(month.netUtilityKwh || 0).toFixed(0)} kWh</p></div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Alerts</h2>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.id} className={`card flex items-start gap-3 ${a.severity === 'CRITICAL' ? 'border-red-500/30' : a.severity === 'WARNING' ? 'border-yellow-500/30' : ''}`}>
                {a.severity === 'CRITICAL' ? <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" /> :
                 a.severity === 'WARNING' ? <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" /> :
                 <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />}
                <div><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-gray-400">{a.message}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
