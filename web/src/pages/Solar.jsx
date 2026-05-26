import { useState } from 'react';
import KpiCard from '../components/KpiCard';
import { Sun, TrendingUp, Activity, BarChart3 } from 'lucide-react';

export default function Solar() {
  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Solar Analytics</h1>

      {/* Live */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Current Production</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard title="Now" value="0.0 kW" icon={Sun} color="text-solar-400" bgColor="bg-solar-500/10" />
          <KpiCard title="Today" value="0.0 kWh" icon={TrendingUp} color="text-green-400" bgColor="bg-green-500/10" />
          <div className="kpi-card">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Activity className="w-5 h-5 text-blue-400" /></div>
            <p className="text-sm text-gray-400">Inverter</p>
            <p className="text-lg font-bold">SMA Sunny Boy</p>
            <span className="inline-flex items-center gap-1 text-xs text-green-400"><span className="w-2 h-2 bg-green-400 rounded-full" /> Online</span>
          </div>
        </div>
      </div>

      {/* Monthly */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">This Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard title="Generated" value="0 kWh" icon={Sun} color="text-solar-400" bgColor="bg-solar-500/10" />
          <KpiCard title="Offset" value="0%" icon={TrendingUp} color="text-green-400" bgColor="bg-green-500/10" />
        </div>
      </div>

      {/* Self-Consumption */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Self-Consumption</h2>
        <div className="card">
          <p className="text-sm text-gray-400 mb-4">Solar energy used directly by your home vs exported to the grid.</p>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '0%' }} />
          </div>
          <p className="text-sm text-gray-500">0% self-consumed</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Production History</h2>
        <div className="card flex flex-col items-center justify-center h-64">
          <BarChart3 className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-gray-400">Production chart</p>
          <p className="text-sm text-gray-600">Connect SMA to see data</p>
        </div>
      </div>
    </div>
  );
}
