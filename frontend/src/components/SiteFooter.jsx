import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <div className="brand" style={{ marginBottom: 10 }}>
          <span className="brand-mark">PF</span>
          PulseForge
        </div>
        <p>A club for people who are done waiting to feel alive.</p>
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Link to="/membership">Membership</Link>
        <Link to="/watch">Watch</Link>
        <Link to="/join">Join</Link>
        <Link to="/login">Staff</Link>
      </div>
    </footer>
  );
}
