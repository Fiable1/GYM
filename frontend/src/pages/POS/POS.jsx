import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Modal, Badge, PageHeader, Pagination, SearchInput, Toolbar, formatMoney, formatDate, StatCard, statusColor } from '../../components/UI';
import { Plus, Edit2, Trash2, ShoppingBag, Package } from 'lucide-react';
import { toast } from '../../components/toast';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('products');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/products?page=${page}&limit=15&search=${search}`)
      .then(r => { setProducts(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  const loadSales = () => {
    setLoading(true);
    api.get(`/sales?page=${page}&limit=15`)
      .then(r => { setSales(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { tab === 'products' ? load() : loadSales(); }, [page, search, tab]);

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', category: 'SUPPLEMENTS', stockQuantity: '', sku: '', status: 'ACTIVE' });
    setModal('create');
  };

  const openEdit = (p) => { setForm({ ...p }); setModal('edit'); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity || 0) };
      if (modal === 'create') { await api.post('/products', payload); toast.success('Product created'); }
      else { await api.put(`/products/${form.id}`, payload); toast.success('Product updated'); }
      setModal(null); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Product deleted'); load(); } catch (e) { toast.error('Delete failed'); }
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const categories = ['SUPPLEMENTS', 'APPAREL', 'ACCESSORIES', 'BEVERAGES', 'MERCHANDISE', 'OTHER'];

  return (
    <div>
      <PageHeader title="Shop & Inventory">
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}><Plus size={16} /> Add Product</button>
      </PageHeader>

      <div className="tabs">
        <button className={`tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}><Package size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Products</button>
        <button className={`tab ${tab === 'sales' ? 'active' : ''}`} onClick={() => setTab('sales')}><ShoppingBag size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Sales</button>
      </div>

      {tab === 'products' && (
        <>
          <Toolbar>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." />
          </Toolbar>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          {p.sku && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>SKU: {p.sku}</div>}
                        </div>
                      </td>
                      <td><Badge type="info">{p.category}</Badge></td>
                      <td style={{ fontWeight: 700 }}>{formatMoney(p.price)}</td>
                      <td>
                        <span style={{ color: p.stockQuantity <= 5 ? 'var(--danger)' : 'var(--text-primary)' }}>
                          {p.stockQuantity ?? 0}
                        </span>
                      </td>
                      <td><Badge type={p.status === 'ACTIVE' ? 'success' : 'neutral'}>{p.status}</Badge></td>
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
          <Pagination page={page} total={total} limit={15} onPage={setPage} />
        </>
      )}

      {tab === 'sales' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Sale ID</th><th>Items</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Date</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.id?.slice(0, 8)}...</td>
                    <td>{s.items?.length || s.itemCount || 0} items</td>
                    <td>{formatMoney(s.subtotal)}</td>
                    <td>{formatMoney(s.tax)}</td>
                    <td style={{ fontWeight: 700 }}>{formatMoney(s.total)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
                {sales.length === 0 && !loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No sales recorded</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!modal} title={modal === 'create' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" style={{ width: 'auto' }} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="form-group"><label>Product Name</label><input value={form.name || ''} onChange={(e) => setField('name', e.target.value)} /></div>
        <div className="form-group"><label>Description</label><input value={form.description || ''} onChange={(e) => setField('description', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" value={form.price || ''} onChange={(e) => setField('price', e.target.value)} /></div>
          <div className="form-group"><label>Stock</label><input type="number" value={form.stockQuantity || ''} onChange={(e) => setField('stockQuantity', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Category</label>
            <select value={form.category || 'SUPPLEMENTS'} onChange={(e) => setField('category', e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label>SKU</label><input value={form.sku || ''} onChange={(e) => setField('sku', e.target.value)} /></div>
        </div>
      </Modal>
    </div>
  );
}