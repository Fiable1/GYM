import { Outlet, useLocation } from 'react-router-dom';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import InstallPrompt from './InstallPrompt';
import ScrollToTop from './ScrollToTop';
import Chatbot from './Chatbot';
import '../styles/site.css';

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="site">
      <ScrollToTop />
      <SiteNav />
      <div key={location.pathname} className="site-page">
        <Outlet />
      </div>
      <SiteFooter />
      <InstallPrompt />
      <Chatbot />
    </div>
  );
}



