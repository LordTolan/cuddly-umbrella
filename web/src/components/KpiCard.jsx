export default function KpiCard({ title, value, subtitle, icon: Icon, color = 'text-energy-400', bgColor = 'bg-energy-500/10' }) {
  return (
    <div className="kpi-card">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
