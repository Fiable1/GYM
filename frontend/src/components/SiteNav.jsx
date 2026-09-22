import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Dumbbell, PlaySquare, Flame } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/classes', label: 'Floor' },
  { to: '/membership', label: 'Membership' },
  { to: '/coaches', label: 'Coaches' },
  { to: '/watch', label: 'Watch' },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="brand">
          <span className="brand-mark">PF</span>
          PulseForge
        </Link>
        <nav className="site-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to="/login" className="btn-ghost">Staff</Link>
          <Link to="/join" className="btn-ember">Start today</Link>
          <button className="nav-toggle" type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
      <div className={`drawer ${open ? 'open' : ''}`}>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
        ))}
        <NavLink to="/join">Join now</NavLink>
        <NavLink to="/login">Staff portal</NavLink>
      </div>
      <nav className="dock">
        <NavLink to="/" end><Home size={16} /> Home</NavLink>
        <NavLink to="/classes"><Dumbbell size={16} /> Floor</NavLink>
        <NavLink to="/watch"><PlaySquare size={16} /> Watch</NavLink>
        <NavLink to="/join"><Flame size={16} /> Join</NavLink>
      </nav>
    </>
  );
}
