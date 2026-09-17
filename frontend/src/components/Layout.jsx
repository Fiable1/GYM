import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, CreditCard, Dumbbell, CalendarDays, Fingerprint, Repeat, ShoppingBag, Trophy, Bell, BarChart3, Settings, LogOut, Shield } from 'lucide-react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/members', label: 'Members', icon: <Users size={18} /> },
      { to: '/plans', label: 'Membership Plans', icon: <CreditCard size={18} /> },
      { to: '/checkins', label: 'Access & Check-ins', icon: <Fingerprint size={18} /> },
      { to: '/classes', label: 'Classes & Sessions', icon: <CalendarDays size={18} /> },
      { to: '/equipment', label: 'Equipment', icon: <Dumbbell size={18} /> },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { to: '/billing', label: 'Billing & Invoices', icon: <CreditCard size={18} /> },
      { to: '/pos', label: 'Shop & Inventory', icon: <ShoppingBag size={18} /> },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { to: '/challenges', label: 'Community', icon: <Trophy size={18} /> },
      { to: '/notifications', label: 'Notifications', icon: <Bell size={18} /> },
      { to: '/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
      { to: '/audit-log', label: 'Audit Log', icon: <Shield size={18} /> },
    ],
  },
];

const TITLES = {
  '/': 'Dashboard',
  '/members': 'Members',
  '/plans': 'Membership Plans',
  '/checkins': 'Access & Check-ins',
  '/classes': 'Classes & Sessions',
  '/equipment': 'Equipment',
  '/billing': 'Billing & Invoices',
  '/pos': 'Shop & Inventory',
  '/challenges': 'Community',
  '/notifications': 'Notifications',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/audit-log': 'Audit Log',
  '/work-orders': 'Work Orders',
  '/maintenance': 'Maintenance',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title = Object.entries(TITLES).find(([k]) => location.pathname === k)?.[1]
    || location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ')
    || 'PulseForge';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">PF</div>
          <div>
            <h2>PulseForge</h2>
            <span>Gym Management</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div className="sidebar-section" key={section.title}>
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{user?.firstName?.[0] || user?.email?.[0] || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div className="user-role">{user?.role?.toLowerCase()}</div>
          </div>
          <button className="btn btn-icon" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{title.charAt(0).toUpperCase() + title.slice(1)}</h1>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{greeting}, {user?.firstName}</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}