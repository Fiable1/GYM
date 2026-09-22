import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import PublicLayout from './components/PublicLayout';
import Layout from './components/Layout';
import Login from './pages/Login/Login';
import Home from './pages/public/Home';
import PublicClasses from './pages/public/PublicClasses';
import Membership from './pages/public/Membership';
import Coaches from './pages/public/Coaches';
import Watch from './pages/public/Watch';
import Join from './pages/public/Join';
import Dashboard from './pages/Dashboard/Dashboard';
import Members from './pages/Members/Members';
import Plans from './pages/Plans/Plans';
import Billing from './pages/Billing/Billing';
import Classes from './pages/Scheduling/Classes';
import Checkins from './pages/Access/Checkins';
import Equipment from './pages/Equipment/Equipment';
import WorkOrders from './pages/Equipment/WorkOrders';
import Maintenance from './pages/Equipment/Maintenance';
import POS from './pages/POS/POS';
import Challenges from './pages/Community/Challenges';
import Notifications from './pages/Notifications/Notifications';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import AuditLog from './pages/Settings/AuditLog';

function Protected({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="login-wrapper">
        <div className="loading-spinner" />
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/classes" element={<PublicClasses />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/coaches" element={<Coaches />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/join" element={<Join />} />
      </Route>
      <Route path="/login" element={<Login />} />
      {['members', 'plans', 'billing', 'checkins', 'equipment', 'work-orders', 'maintenance', 'pos', 'challenges', 'notifications', 'reports', 'settings', 'audit-log'].map((p) => (
        <Route key={p} path={`/${p}`} element={<Navigate to={`/app/${p}`} replace />} />
      ))}
      <Route
        path="/app"
        element={(
          <Protected>
            <Layout />
          </Protected>
        )}
      >
        <Route index element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="plans" element={<Plans />} />
        <Route path="billing" element={<Billing />} />
        <Route path="classes" element={<Classes />} />
        <Route path="checkins" element={<Checkins />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="pos" element={<POS />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="audit-log" element={<AuditLog />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
