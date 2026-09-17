import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Modal, Badge, PageHeader, Pagination, formatDate, StatCard, statusColor } from '../../components/UI';
import { Plus, Trophy, Users, TrendingUp } from 'lucide-react';
import { toast } from '../../components/toast';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/challenges?page=${page}&limit=10`)
      .then(r => { setChallenges(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => {
    setForm({ name: '', description: '', type: 'VISITS', startDate: '', endDate: '', goalValue: '', status: 'ACTIVE' });
    setModal('create');
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, goalValue: Number(form.goalValue || 0) };
      if (modal === 'create') { await api.post('/challenges', payload); toast.success('Challenge created'); }
      else { await api.put(`/challenges/${form.id}`, payload); toast.success('Challenge updated'); }
      setModal(null); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const viewLeaderboard = async (id) => {
    try {
      const res = await api.get(`/challenges/${id}`);
      setSelectedChallenge(res.data);
    } catch { }
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title="Community Challenges">
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}><Plus size={16} /> New Challenge</button>
      </PageHeader>

      <div className="stats-grid">
        <StatCard icon={<Trophy size={20} style={{ color: '#ffaa00' }} />} iconBg="var(--warning-light)" value={total} label="Total Challenges" />
        <StatCard icon={<Users size={20} style={{ color: '#6c5ce7' }} />} iconBg="var(--accent-light)" value={challenges.filter(c => c.status === 'ACTIVE').length} label="Active Challenges" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : challenges.map(c => (
          <div className="card" key={c.id} style={{ cursor: 'pointer' }} onClick={() => viewLeaderboard(c.id)}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{c.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.description || 'No description'}</p>
                </div>
                <Badge type={statusColor(c.status)}>{c.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Type: <strong style={{ color: 'var(--text-primary)' }}>{c.type || 'VISITS'}</strong></span>
                {c.goalValue && <span>Goal: <strong style={{ color: 'var(--accent)' }}>{c.goalValue}</strong></span>}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                <span>Start: {formatDate(c.startDate)}</span>
                <span>End: {formatDate(c.endDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal === 'create'} title="New Challenge" onClose={() => setModal(null)}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" style={{ width: 'auto' }} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Create'}</button></>}>
        <div className="form-group"><label>Challenge Name</label><input value={form.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Summer Shred Challenge" /></div>
        <div className="form-group"><label>Description</label><input value={form.description || ''} onChange={(e) => setField('description', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Type</label>
            <select value={form.type || 'VISITS'} onChange={(e) => setField('type', e.target.value)}>
              <option value="VISITS">Visits</option>
              <option value="WEIGHT_LOSS">Weight Loss</option>
              <option value="STRENGTH">Strength</option>
              <option value="CONSISTENCY">Consistency</option>
              <option value="REFERRALS">Referrals</option>
            </select>
          </div>
          <div className="form-group"><label>Goal Value</label><input type="number" value={form.goalValue || ''} onChange={(e) => setField('goalValue', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate ? form.startDate.slice(0, 10) : ''} onChange={(e) => setField('startDate', e.target.value)} /></div>
          <div className="form-group"><label>End Date</label><input type="date" value={form.endDate ? form.endDate.slice(0, 10) : ''} onChange={(e) => setField('endDate', e.target.value)} /></div>
        </div>
      </Modal>

      <Modal open={!!selectedChallenge} title={`${selectedChallenge?.name || 'Challenge'} - Leaderboard`} onClose={() => setSelectedChallenge(null)}>
        {selectedChallenge && (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{selectedChallenge.description}</p>
            {selectedChallenge.entries?.length > 0 ? (
              <table>
                <thead><tr><th>#</th><th>Member</th><th>Progress</th></tr></thead>
                <tbody>
                  {selectedChallenge.entries.sort((a, b) => (b.progress || 0) - (a.progress || 0)).map((e, i) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 700 }}>{i + 1}</td>
                      <td>{e.memberId?.slice(0, 8)}...</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="fill" style={{ width: `${Math.min(100, ((e.progress || 0) / (selectedChallenge.goalValue || 1)) * 100)}%`, background: 'var(--accent)' }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{e.progress || 0}/{selectedChallenge.goalValue || '—'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No entries yet</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}