import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Modal, PageHeader, SearchInput, Toolbar, formatMoney } from '../../components/UI';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from '../../components/toast';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/membership-plans?limit=100&search=${search}`)
      .then(r => setPlans(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setForm({ name: '', description: '', price: '', interval: 'MONTHLY', status: 'ACTIVE' }); setModal('create'); };
  const openEdit = (p) => { setForm({ ...p }); setModal('edit'); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (modal === 'create') { await api.post('/membership-plans', payload); toast.success('Plan created'); }
      else { await api.put(`/membership-plans/${form.id}`, payload); toast.success('Plan updated'); }
      setModal(null); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try { await api.delete(`/membership-plans/${id}`); toast.success('Plan deleted'); load(); } catch (e) { toast.error('Delete failed'); }
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const intervals = { MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', ANNUALLY: 'Annually', WEEKLY: 'Weekly' };

  return (
    <div>
      <PageHeader title="Membership Plans">
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}><Plus size={16} /> Add Plan</button>
      </PageHeader>
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search plans..." />
      </Toolbar>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Plan</th><th>Price</th><th>Interval</th><th>Status</th><th style={{ width: 100 }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : plans.map(p => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      {p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.description}</div>}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatMoney(p.price)}</td>
                  <td>{intervals[p.interval] || p.interval}</td>
                  <td><span className={`badge badge-${p.status === 'ACTIVE' ? 'success' : 'neutral'}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-icon" onClick={() => openEdit(p)}><Edit2 size={15} /></button>
                      <button className="btn btn-icon" onClick={() => remove(p.id)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!modal} title={modal === 'create' ? 'Add Plan' : 'Edit Plan'} onClose={() => setModal(null)}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" style={{ width: 'auto' }} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="form-group">
          <label>Plan Name</label>
          <input value={form.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Premium Monthly" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input value={form.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="What's included..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" value={form.price || ''} onChange={(e) => setField('price', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Interval</label>
            <select value={form.interval || 'MONTHLY'} onChange={(e) => setField('interval', e.target.value)}>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="ANNUALLY">Annually</option>
            </select>
          </div>
        </div>
        {modal === 'edit' && (
          <div className="form-group">
            <label>Status</label>
            <select value={form.status || 'ACTIVE'} onChange={(e) => setField('status', e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}
      </Modal>
    </div>
  );
}