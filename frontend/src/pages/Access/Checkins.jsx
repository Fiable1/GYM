import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Badge, PageHeader, Pagination, SearchInput, Toolbar, formatDateTime, StatCard } from '../../components/UI';
import { Fingerprint, LogIn, LogOut, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Checkins() {
  const [checkins, setCheckins] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/check-ins?page=${page}&limit=20&search=${search}`)
      .then(r => { setCheckins(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);
  useEffect(() => { api.get('/reports/dashboard').then(r => {
    const d = r.data;
    setStats({ today: d.todayCheckins, total: d.totalMembers });
  }); }, []);

  return (
    <div>
      <PageHeader title="Access & Check-ins" />

      {stats && (
        <div className="stats-grid">
          <StatCard icon={<LogIn size={20} style={{ color: '#00d68f' }} />} iconBg="var(--success-light)" value={stats.today} label="Today's Check-ins" />
          <StatCard icon={<Fingerprint size={20} style={{ color: '#6c5ce7' }} />} iconBg="var(--accent-light)" value={total} label="Total Check-ins" />
          <StatCard icon={<AlertTriangle size={20} style={{ color: '#ffaa00' }} />} iconBg="var(--warning-light)" value={checkins.filter(c => c.type === 'TAILGATE').length} label="Tailgate Detections" />
        </div>
      )}

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search check-ins..." />
      </Toolbar>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Member</th><th>Type</th><th>Time</th><th>Method</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : checkins.map(c => (
                <tr key={c.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.memberId?.slice(0, 8)}...</span></td>
                  <td><Badge type={c.type === 'TAILGATE' ? 'danger' : 'info'}>{c.type || 'CHECK_IN'}</Badge></td>
                  <td>{formatDateTime(c.checkInTime)}</td>
                  <td><Badge type="neutral">{c.method || 'KEY_FOB'}</Badge></td>
                  <td><Badge type={c.status === 'GRANTED' ? 'success' : c.status === 'DENIED' ? 'danger' : 'info'}>{c.status || 'GRANTED'}</Badge></td>
                </tr>
              ))}
              {checkins.length === 0 && !loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No check-ins found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}