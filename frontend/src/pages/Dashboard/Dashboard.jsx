import { useState, useEffect } from 'react';
import api from '../../api/client';
import { StatCard, formatMoney, formatDate } from '../../components/UI';
import { Users, DollarSign, Fingerprint, Calendar, AlertTriangle, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6c5ce7', '#00d68f', '#ffaa00', '#0095ff', '#ff3d71', '#a78bfa'];

export default function Dashboard() {
  const [dash, setDash] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [visits, setVisits] = useState([]);
  const [demo, setDemo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports/revenue?months=6'),
      api.get('/reports/visits?days=14'),
      api.get('/reports/demographics'),
    ]).then(([d, r, v, dm]) => {
      setDash(d.data);
      setRevenue(r.data);
      setVisits(v.data);
      setDemo(dm.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !dash) {
    return <div className="empty-state" style={{ padding: '60px' }}><div className="loading-spinner" /></div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <StatCard
          icon={<Users size={20} style={{ color: '#6c5ce7' }} />}
          iconBg="var(--accent-light)"
          value={dash.totalMembers}
          label="Total Members"
        />
        <StatCard
          icon={<DollarSign size={20} style={{ color: '#00d68f' }} />}
          iconBg="var(--success-light)"
          value={formatMoney(dash.totalRevenue)}
          label="Total Revenue"
        />
        <StatCard
          icon={<Fingerprint size={20} style={{ color: '#0095ff' }} />}
          iconBg="var(--info-light)"
          value={dash.todayCheckins}
          label="Check-ins Today"
        />
        <StatCard
          icon={<Calendar size={20} style={{ color: '#ffaa00' }} />}
          iconBg="var(--warning-light)"
          value={dash.bookingsToday}
          label="Bookings Today"
        />
        <StatCard
          icon={<AlertTriangle size={20} style={{ color: '#ff3d71' }} />}
          iconBg="var(--danger-light)"
          value={dash.churnByRisk.HIGH + dash.churnByRisk.MEDIUM}
          label="At-Risk Members"
          change={`${dash.churnByRisk.HIGH} high risk`}
          changeDir="down"
        />
        <StatCard
          icon={<TrendingUp size={20} style={{ color: '#a78bfa' }} />}
          iconBg="rgba(167,139,250,0.12)"
          value={formatMoney(dash.pendingRevenue)}
          label="Pending Revenue"
        />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><h3>Revenue Trend</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c1f2b', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f0f0f5' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6c5ce7" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Daily Visits (14 days)</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={visits}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickFormatter={(v) => v?.slice(5)} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c1f2b', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f0f0f5' }} />
                <Bar dataKey="visits" fill="#00d68f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="card">
          <div className="card-header"><h3>Membership by Status</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={demo.byStatus.map(d => ({ name: d.status, value: Number(d.count) }))}
                  cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {demo.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1c1f2b', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f0f0f5' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Key Metrics</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Active Members', value: dash.activeMembers, color: '#00d68f' },
              { label: 'Active Memberships', value: dash.activeMemberships, color: '#6c5ce7' },
              { label: 'New This Month', value: dash.newMembersMonth, color: '#0095ff' },
              { label: 'Today\'s Sessions', value: dash.todaysSessions, color: '#ffaa00' },
              { label: 'Total Transactions', value: dash.totalTransactions, color: '#a78bfa' },
              { label: 'Avg Lifetime Value', value: formatMoney(dash.avgLtv), color: '#00d68f' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}