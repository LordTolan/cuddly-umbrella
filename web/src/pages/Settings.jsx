import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Gauge, Sun, Bell, DollarSign, Info, FileText, Scale, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', detail: user?.displayName || 'Not set' },
        { icon: Mail, label: 'Email', detail: user?.email || '' },
      ],
    },
    {
      title: 'Devices',
      items: [
        { icon: Gauge, label: 'Emporia Vue', detail: 'Manage connection' },
        { icon: Sun, label: 'SMA Inverter', detail: 'Manage connection' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', detail: 'Configure alerts' },
        { icon: DollarSign, label: 'TOU Rates', detail: 'Set your utility rate schedule' },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: Info, label: 'Version', detail: '1.0.0' },
        { icon: FileText, label: 'Privacy Policy', detail: '' },
        { icon: Scale, label: 'Terms of Service', detail: '' },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-sm font-medium text-energy-400 mb-2 uppercase tracking-wider">{section.title}</h2>
          <div className="card divide-y divide-gray-800 p-0 overflow-hidden">
            {section.items.map(({ icon: Icon, label, detail }) => (
              <button key={label} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-800/40 transition-colors text-left">
                <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  {detail && <p className="text-xs text-gray-500 truncate">{detail}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleLogout} className="w-full card flex items-center gap-3 text-red-400 hover:bg-red-500/5 transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
}
