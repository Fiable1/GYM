import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Modal, Badge, PageHeader, Pagination, SearchInput, Toolbar, formatDate, statusColor } from '../../components/UI';
import { Plus, Edit2, Trash2, Users, Calendar, Clock } from 'lucide-react';
import { toast } from '../../components/toast';

export default function Classes() {
  const [tab, setTab] = useState('sessions');
  const [classTypes, setClassTypes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadSessions = () => {
    setLoading(true);
    api.get(`/sessions?page=${page}&limit=15&search=${search}`)
      .then(r => { setSessions(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  const loadBookings = () => {
    setLoading(true);
    api.get('/bookings?limit=100')
      .then(r => { setBookings(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { api.get('/class-types?limit=100').then(r => setClassTypes(r.data.data || [])); }, []);
  useEffect(() => { tab === 'sessions' ? loadSessions() : loadBookings(); }, [tab, page, search]);

  const openCreateSession = () => {
    setForm({ classTypeId: classTypes[0]?.id || '', startTime: '', endTime: '', instructor: '', capacity: 20, status: 'SCHEDULED' });
    setModal('createSession');
  };

  const saveSession = async () => {
    setSaving(true);
    try {
      await api.post('/sessions', form);
      toast.success('Session created');
      setModal(null); loadSessions();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const removeSession = async (id) => {
    if (!confirm('Delete this session?')) return;
    try { await api.delete(`/sessions/${id}`); toast.success('Session deleted'); loadSessions(); } catch (e) { toast.error('Delete failed'); }
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title="Classes & Sessions">
        {tab === 'sessions' && (
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreateSession}><Plus size={16} /> New Session</button>
        )}
      </PageHeader>

      <div className="tabs">
        <button className={`tab ${tab === 'sessions' ? 'active' : ''}`} onClick={() => setTab('sessions')}>
          <Calendar size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Sessions
        </button>
        <button className={`tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
          <Users size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Bookings
        </button>
        <button className={`tab ${tab === 'types' ? 'active' : ''}`} onClick={() => setTab('types')}>
          <Clock size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Class Types
        </button>
      </div>

      {tab === 'sessions' && (
        <>
          <Toolbar>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search sessions..." />
          </Toolbar>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Class</th><th>Instructor</th><th>Start Time</th><th>End Time</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : sessions.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.classType?.name || s.classTypeId?.slice(0, 8) || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.instructor || '—'}</td>
                      <td>{formatDate(s.startTime)}</td>
                      <td>{formatDate(s.endTime)}</td>
                      <td>{s.bookedCount || 0}/{s.capacity || 0}</td>
                      <td><Badge type={statusColor(s.status)}>{s.status}</Badge></td>
                      <td>
                        <button className="btn btn-icon" onClick={() => removeSession(s.id)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={total} limit={15} onPage={setPage} />
        </>
      )}

      {tab === 'bookings' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Member</th><th>Session</th><th>Status</th><th>Booked At</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.memberId?.slice(0, 8) || '—'}...</td>
                    <td>{b.sessionId?.slice(0, 8) || '—'}...</td>
                    <td><Badge type={statusColor(b.status)}>{b.status}</Badge></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'types' && (
        <div className="stats-grid">
          {classTypes.map(ct => (
            <div className="stat-card" key={ct.id}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{ct.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{ct.description || 'No description'}</div>
              {ct.durationMinutes && <div style={{ color: 'var(--accent)', fontSize: 13, marginTop: 8 }}>{ct.durationMinutes} min</div>}
              {ct.maxCapacity && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Max: {ct.maxCapacity}</div>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal === 'createSession'} title="New Session" onClose={() => setModal(null)}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" style={{ width: 'auto' }} onClick={saveSession} disabled={saving}>{saving ? 'Saving...' : 'Create'}</button></>}>
        <div className="form-group">
          <label>Class Type</label>
          <select value={form.classTypeId || ''} onChange={(e) => setField('classTypeId', e.target.value)}>
            {classTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Start Time</label><input type="datetime-local" value={form.startTime ? form.startTime.slice(0, 16) : ''} onChange={(e) => setField('startTime', e.target.value)} /></div>
          <div className="form-group"><label>End Time</label><input type="datetime-local" value={form.endTime ? form.endTime.slice(0, 16) : ''} onChange={(e) => setField('endTime', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Instructor</label><input value={form.instructor || ''} onChange={(e) => setField('instructor', e.target.value)} /></div>
          <div className="form-group"><label>Capacity</label><input type="number" value={form.capacity || 20} onChange={(e) => setField('capacity', Number(e.target.value))} /></div>
        </div>
      </Modal>
    </div>
  );
}