import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Modal, Badge, PageHeader, Pagination, SearchInput, Toolbar, formatDate, formatMoney, statusColor, avatarInitials } from '../../components/UI';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from '../../components/toast';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/members?page=${page}&limit=15&search=${search}`)
      .then(r => { setMembers(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);
  useEffect(() => { api.get('/membership-plans?limit=100').then(r => setPlans(r.data.data || [])); }, []);

  const openCreate = () => {
    setForm({ firstName: '', lastName: '', email: '', phone: '', status: 'ACTIVE' });
    setModal('create');
  };

  const openEdit = (m) => {
    setForm({ ...m });
    setModal('edit');
  };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/members', form);
        toast.success('Member created');
      } else {
        await api.put(`/members/${form.id}`, form);
        toast.success('Member updated');
      }
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving member');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this member?')) return;
    try {
      await api.delete(`/members/${id}`);
      toast.success('Member deleted');
      load();
    } catch (e) { toast.error('Delete failed'); }
  };

  const showDetail = async (id) => {
    const res = await api.get(`/members/${id}`);
    setDetail(res.data);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title="Members">
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}><Plus size={16} /> Add Member</button>
      </PageHeader>

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search members..." />
      </Toolbar>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Visits</th>
                <th>Joined</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No members found</td></tr>
              ) : members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar-circle">{avatarInitials(m.firstName)}</div>
                      <span style={{ fontWeight: 600 }}>{m.firstName} {m.lastName}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.phone || '—'}</td>
                  <td><Badge type={statusColor(m.status)}>{m.status}</Badge></td>
                  <td>{m.totalVisits || 0}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(m.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-icon" onClick={() => showDetail(m.id)} title="View"><Eye size={15} /></button>
                      <button className="btn btn-icon" onClick={() => openEdit(m)} title="Edit"><Edit2 size={15} /></button>
                      <button className="btn btn-icon" onClick={() => remove(m.id)} title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} total={total} limit={15} onPage={setPage} />

      <Modal open={modal === 'create' || modal === 'edit'} title={modal === 'create' ? 'Add Member' : 'Edit Member'}
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>First Name</label>
            <input value={form.firstName || ''} onChange={(e) => setField('firstName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input value={form.lastName || ''} onChange={(e) => setField('lastName', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email || ''} onChange={(e) => setField('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone || ''} onChange={(e) => setField('phone', e.target.value)} />
        </div>
        {modal === 'edit' && (
          <div className="form-group">
            <label>Status</label>
            <select value={form.status || 'ACTIVE'} onChange={(e) => setField('status', e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="AT_RISK">At Risk</option>
            </select>
          </div>
        )}
      </Modal>

      <Modal open={!!detail} title="Member Details" onClose={() => setDetail(null)}>
        {detail && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div className="avatar-circle" style={{ width: 56, height: 56, fontSize: 20 }}>{avatarInitials(detail.firstName)}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{detail.firstName} {detail.lastName}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{detail.email}</p>
              </div>
              <Badge type={statusColor(detail.status)} style={{ marginLeft: 'auto' }}>{detail.status}</Badge>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><label>Phone</label><span>{detail.phone || '—'}</span></div>
              <div className="detail-item"><label>Total Visits</label><span>{detail.totalVisits || 0}</span></div>
              <div className="detail-item"><label>Joined</label><span>{formatDate(detail.createdAt)}</span></div>
              <div className="detail-item"><label>Member ID</label><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{detail.id?.slice(0, 8)}...</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}