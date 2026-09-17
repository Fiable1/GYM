import { useState, useEffect } from 'react';
import api from '../../api/client';
import { StatCard, formatMoney, PageHeader } from '../../components/UI';
import { Users, DollarSign, Activity, TrendingUp, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6c5ce7', '#00d68f', '#ffaa00', '#0095ff', '#ff3d71', '#a78bfa'];

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [retention, setRetention] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [lifeline, setLifeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports/revenue?months=6'),
      api.get('/reports/retention'),
      api.get('/reports/demographics'),
      api.get('/reports/lifeline'),
    ]).then(([d, r, rt, dm, lf]) => {
      setDashboard(d.data);
      setRevenue(r.data);
      setRetention(rt.data);
      setDemographics(dm.data);
      setLifeline(lf.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state" style={{ padding: 60 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>;

  return (
    <div>
      <PageHeader title="Reports & Analytics" />

      <div className="stats-grid">
        <StatCard icon={<Users size={20} style={{ color: '#6c5ce7' }} />} iconBg="var(--accent-light)" value={dashboard?.totalMembers || 0} label="Total Members" />
        <StatCard icon={<DollarSign size={20} style={{ color: '#00d68f' }} />} iconBg="var(--success-light)" value={formatMoney(dashboard?.totalRevenue)} label="Total Revenue" />
        <StatCard icon={<Activity size={20} style={{ color: '#0095ff' }} />} iconBg="var(--info-light)" value={dashboard?.todayCheckins || 0} label="Today's Check-ins" />
        <StatCard icon={<TrendingUp size={20} style={{ color: '#a78bfa' }} />} iconBg="rgba(167,139,250,0.12)" value={formatMoney(dashboard?.avgLtv)} label="Avg Lifetime Value" />
      </div>

      {lifeline.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Business Lifeline</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {lifeline.map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: COLORS[i % COLORS.length] }}>{item.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><h3>Revenue Trend</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c1f2b', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f0f0f5' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6c5ce7" fill="url(#gradRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Member Status</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={(demographics?.byStatus || []).map(d => ({ name: d.status, value: Number(d.count) }))}
                  cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {(demographics?.byStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1c1f2b', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f0f0f5' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {retention?.cohorts?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Retention Cohorts</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={retention.cohorts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c1f2b', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f0f0f5' }} />
                <Bar dataKey="members" fill="#00d68f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {demographics?.byPlan?.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Members by Plan</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={demographics.byPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="planId" stroke="#6b7280" fontSize={12} tickFormatter={(v) => v?.slice(0, 8)} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c1f2b', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f0f0f5' }} />
                <Bar dataKey="count" fill="#ffaa00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}