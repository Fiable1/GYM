import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Modal, Badge, PageHeader, Pagination, SearchInput, Toolbar, formatMoney, formatDate, statusColor } from '../../components/UI';
import { DollarSign, AlertCircle, CheckCircle, Clock, CreditCard, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from '../../components/toast';

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('invoices');

  const load = () => {
    setLoading(true);
    let url = `/invoices?page=${page}&limit=15&search=${search}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    api.get(url).then(r => { setInvoices(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search, statusFilter]);
  useEffect(() => { api.get('/invoices/stats/summary').then(r => setSummary(r.data)); }, []);

  const markPaid = async (id) => {
    try {
      await api.post(`/invoices/${id}/pay`, { gateway: 'CASH' });
      toast.success('Invoice marked as paid');
      load();
      api.get('/invoices/stats/summary').then(r => setSummary(r.data));
    } catch (e) { toast.error(e.response?.data?.message || 'Payment failed'); }
  };

  return (
    <div>
      <PageHeader title="Billing & Invoices" />

      {summary && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-header"><div className="stat-icon" style={{ background: 'var(--success-light)' }}><DollarSign size={20} style={{ color: '#00d68f' }} /></div></div>
            <div className="stat-value">{formatMoney(summary.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-header"><div className="stat-icon" style={{ background: 'var(--warning-light)' }}><Clock size={20} style={{ color: '#ffaa00' }} /></div></div>
            <div className="stat-value">{formatMoney(summary.openBalance)}</div>
            <div className="stat-label">Open Balance</div>
          </div>
          <div className="stat-card">
            <div className="stat-header"><div className="stat-icon" style={{ background: 'var(--danger-light)' }}><AlertCircle size={20} style={{ color: '#ff3d71' }} /></div></div>
            <div className="stat-value">{formatMoney(summary.overdueBalance)}</div>
            <div className="stat-label">Overdue Balance</div>
          </div>
          <div className="stat-card">
            <div className="stat-header"><div className="stat-icon" style={{ background: 'var(--info-light)' }}><CheckCircle size={20} style={{ color: '#0095ff' }} /></div></div>
            <div className="stat-value">{summary.paidInvoices}</div>
            <div className="stat-label">Paid Invoices</div>
          </div>
        </div>
      )}

      {summary?.monthly?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Revenue by Month</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={summary.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1c1f2b', border: '1px solid #2a2d3a', borderRadius: 8, color: '#f0f0f5' }} />
                <Bar dataKey="total" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>Invoices</button>
        <button className={`tab ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>Transactions</button>
      </div>

      {tab === 'invoices' && (
        <>
          <Toolbar>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoices..." />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </Toolbar>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Invoice</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Paid At</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : invoices.map(inv => (
                    <tr key={inv.id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{inv.id?.slice(0, 8)}...</span></td>
                      <td style={{ fontWeight: 700 }}>{formatMoney(inv.total || inv.amount)}</td>
                      <td><Badge type={statusColor(inv.status)}>{inv.status}</Badge></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(inv.dueDate)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(inv.paidAt)}</td>
                      <td>
                        {inv.status !== 'PAID' && (
                          <button className="btn btn-sm btn-success" onClick={() => markPaid(inv.id)}>
                            <CreditCard size={14} /> Pay
                          </button>
                        )}
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

      {tab === 'transactions' && <TransactionsTab />}
    </div>
  );
}

function TransactionsTab() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/transactions?page=${page}&limit=15`)
      .then(r => { setTxs(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Transaction ID</th><th>Amount</th><th>Gateway</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : txs.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{t.id?.slice(0, 8)}...</td>
                  <td style={{ fontWeight: 700 }}>{formatMoney(t.amount)}</td>
                  <td><Badge type="info">{t.gateway || 'STRIPE'}</Badge></td>
                  <td><Badge type={t.status === 'SUCCEEDED' ? 'success' : 'warning'}>{t.status}</Badge></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(t.createdAt)}</td>
                </tr>
              ))}
              {txs.length === 0 && !loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No transactions</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={total} limit={15} onPage={setPage} />
    </>
  );
}