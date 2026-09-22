import { Outlet, useLocation } from 'react-router-dom';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import InstallPrompt from './InstallPrompt';
import '../styles/site.css';

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="site">
      <SiteNav />
      <div key={location.pathname} className="site-page">
        <Outlet />
      </div>
      <SiteFooter />
      <InstallPrompt />
    </div>
  );
}
