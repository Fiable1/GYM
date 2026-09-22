import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, CreditCard, Dumbbell, CalendarDays, Fingerprint, ShoppingBag, Trophy, Bell, BarChart3, Settings, LogOut, Shield, Menu, X } from 'lucide-react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { to: '/app', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/app/members', label: 'Members', icon: <Users size={18} /> },
      { to: '/app/plans', label: 'Membership Plans', icon: <CreditCard size={18} /> },
      { to: '/app/checkins', label: 'Access & Check-ins', icon: <Fingerprint size={18} /> },
      { to: '/app/classes', label: 'Classes & Sessions', icon: <CalendarDays size={18} /> },
      { to: '/app/equipment', label: 'Equipment', icon: <Dumbbell size={18} /> },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { to: '/app/billing', label: 'Billing & Invoices', icon: <CreditCard size={18} /> },
      { to: '/app/pos', label: 'Shop & Inventory', icon: <ShoppingBag size={18} /> },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { to: '/app/challenges', label: 'Community', icon: <Trophy size={18} /> },
      { to: '/app/notifications', label: 'Notifications', icon: <Bell size={18} /> },
      { to: '/app/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/app/settings', label: 'Settings', icon: <Settings size={18} /> },
      { to: '/app/audit-log', label: 'Audit Log', icon: <Shield size={18} /> },
    ],
  },
];

const TITLES = {
  '/app': 'Dashboard',
  '/app/members': 'Members',
  '/app/plans': 'Membership Plans',
  '/app/checkins': 'Access & Check-ins',
  '/app/classes': 'Classes & Sessions',
  '/app/equipment': 'Equipment',
  '/app/billing': 'Billing & Invoices',
  '/app/pos': 'Shop & Inventory',
  '/app/challenges': 'Community',
  '/app/notifications': 'Notifications',
  '/app/reports': 'Reports',
  '/app/settings': 'Settings',
  '/app/audit-log': 'Audit Log',
  '/app/work-orders': 'Work Orders',
  '/app/maintenance': 'Maintenance',
};

const SPARKS = [
  'The members who show up today are buying tomorrow.',
  'A quiet floor is a call to coach harder, not wait.',
  'Every check-in is someone choosing not to quit.',
  'Lead the room like someone still needs this more than they admit.',
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [greeting, setGreeting] = useState('');
  const [spark] = useState(() => SPARKS[Math.floor(Math.random() * SPARKS.length)]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title = Object.entries(TITLES).find(([k]) => location.pathname === k)?.[1]
    || location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ')
    || 'PulseForge';

  return (
    <div className="app-layout">
      {menuOpen && <button type="button" className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
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
            <button type="button" className="btn btn-icon menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1>{title.charAt(0).toUpperCase() + title.slice(1)}</h1>
          </div>
          <div className="topbar-right">
            <Link to="/" className="btn btn-sm btn-secondary">Public site</Link>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{greeting}, {user?.firstName}</span>
          </div>
        </header>
        <div className="page-content">
          <p className="spark-line">{spark}</p>
          <div key={location.pathname} className="page-fade">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}