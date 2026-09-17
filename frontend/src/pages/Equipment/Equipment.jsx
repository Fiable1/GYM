import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Modal, Badge, PageHeader, Pagination, SearchInput, Toolbar, formatDate, formatMoney, statusColor } from '../../components/UI';
import { Plus, Edit2, Trash2, Wrench, AlertTriangle, Activity } from 'lucide-react';
import { toast } from '../../components/toast';

export default function Equipment() {
  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('assets');

  const load = () => {
    setLoading(true);
    api.get(`/equipment?page=${page}&limit=15&search=${search}`)
      .then(r => { setAssets(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  const openCreate = () => {
    setForm({ name: '', model: '', manufacturer: '', category: 'CARDIO', status: 'ONLINE', location: '', installDate: '' });
    setModal('create');
  };

  const openEdit = (a) => { setForm({ ...a }); setModal('edit'); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'create') { await api.post('/equipment', form); toast.success('Asset created'); }
      else { await api.put(`/equipment/${form.id}`, form); toast.success('Asset updated'); }
      setModal(null); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this asset?')) return;
    try { await api.delete(`/equipment/${id}`); toast.success('Asset deleted'); load(); } catch (e) { toast.error('Delete failed'); }
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const categories = ['CARDIO', 'STRENGTH', 'FREE_WEIGHTS', 'FUNCTIONAL', 'GROUP_FITNESS', 'OTHER'];

  return (
    <div>
      <PageHeader title="Equipment">
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}><Plus size={16} /> Add Asset</button>
      </PageHeader>

      <div className="tabs">
        <button className={`tab ${tab === 'assets' ? 'active' : ''}`} onClick={() => setTab('assets')}>Assets</button>
        <button className={`tab ${tab === 'work-orders' ? 'active' : ''}`} onClick={() => setTab('work-orders')}>Work Orders</button>
      </div>

      {tab === 'assets' && (
        <>
          <Toolbar>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search equipment..." />
          </Toolbar>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Asset</th><th>Category</th><th>Manufacturer</th><th>Status</th><th>Location</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : assets.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.name}</div>
                          {a.model && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.model}</div>}
                        </div>
                      </td>
                      <td><Badge type="info">{a.category}</Badge></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{a.manufacturer || '—'}</td>
                      <td><Badge type={statusColor(a.status)}>{a.status}</Badge></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{a.location || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-icon" onClick={() => openEdit(a)}><Edit2 size={15} /></button>
                          <button className="btn btn-icon" onClick={() => remove(a.id)} style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                        </div>
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

      {tab === 'work-orders' && <WorkOrdersInline />}

      <Modal open={!!modal} title={modal === 'create' ? 'Add Asset' : 'Edit Asset'} onClose={() => setModal(null)}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" style={{ width: 'auto' }} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={(e) => setField('name', e.target.value)} /></div>
          <div className="form-group"><label>Model</label><input value={form.model || ''} onChange={(e) => setField('model', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Manufacturer</label><input value={form.manufacturer || ''} onChange={(e) => setField('manufacturer', e.target.value)} /></div>
          <div className="form-group"><label>Category</label>
            <select value={form.category || 'CARDIO'} onChange={(e) => setField('category', e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label>Location</label><input value={form.location || ''} onChange={(e) => setField('location', e.target.value)} /></div>
        {modal === 'edit' && (
          <div className="form-group"><label>Status</label>
            <select value={form.status || 'ONLINE'} onChange={(e) => setField('status', e.target.value)}>
              <option value="ONLINE">Online</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OFFLINE">Offline</option>
              <option value="FAULT">Fault</option>
            </select>
          </div>
        )}
      </Modal>
    </div>
  );
}

function WorkOrdersInline() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/work-orders?limit=50').then(r => { setOrders(r.data.data || []); }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Order ID</th><th>Asset</th><th>Issue</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : orders.map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.id?.slice(0, 8)}...</td>
                <td>{o.equipmentAssetId?.slice(0, 8) || '—'}...</td>
                <td>{o.issue || o.description || '—'}</td>
                <td><Badge type={o.priority === 'CRITICAL' ? 'danger' : o.priority === 'HIGH' ? 'warning' : 'info'}>{o.priority || 'MEDIUM'}</Badge></td>
                <td><Badge type={statusColor(o.status)}>{o.status || 'OPEN'}</Badge></td>
                <td style={{ color: 'var(--text-secondary)' }}>{formatDate(o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && !loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No work orders</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}