import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Badge, PageHeader, Pagination, SearchInput, Toolbar, formatDate } from '../../components/UI';
import { Inbox, Check, X, UserPlus, RefreshCw } from 'lucide-react';
import { toast } from '../../components/toast';

const TABS = [
  { key: 'NEW', label: 'New' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: '', label: 'All' },
];

const STATUS_TYPE = {
  NEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CONVERTED: 'info',
};

export default function JoinRequests() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ NEW: 0, APPROVED: 0, REJECTED: 0, CONVERTED: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('NEW');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState('');
  const [modal, setModal] = useState(null);
  const [createAccount, setCreateAccount] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (search) params.set('search', search);
    if (tab) params.set('status', tab);
    api.get(`/join-requests?${params}`)
      .then((r) => {
        setRows(r.data.data || []);
        setTotal(r.data.total || 0);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  const loadCounts = () => {
    api.get('/join-requests/counts').then((r) => setCounts(r.data || {})).catch(() => {});
  };

  useEffect(() => { load(); }, [page, tab, search]);
  useEffect(() => { loadCounts(); }, []);

  const openReview = (row, decision) => {
    setModal({ row, decision });
    setNote('');
  };

  const submitReview = async () => {
    if (!modal) return;
    const { row, decision } = modal;
    setBusy(row.id);
    try {
      const res = await api.put(`/join-requests/${row.id}/review`, {
        decision,
        staffNote: note.trim() || undefined,
        createAccount: decision === 'APPROVED' ? createAccount : false,
      });
      toast.success(
        decision === 'APPROVED'
          ? `Approved. Email ${res.data?.emailDelivered ? 'sent' : 'queued'} to ${row.email}.`
          : `Request rejected. Email ${res.data?.emailDelivered ? 'sent' : 'queued'}.`,
      );
      setModal(null);
      load();
      loadCounts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save the decision');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader title="Join Requests">
        <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => { load(); loadCounts(); }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </PageHeader>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {['NEW', 'APPROVED', 'REJECTED', 'CONVERTED'].map((k) => (
          <div className="card" key={k} style={{ padding: 16, cursor: 'pointer', borderColor: tab === k ? 'var(--accent)' : undefined }} onClick={() => { setTab(k); setPage(1); }}>
            <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k.toLowerCase()}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{counts[k] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key || 'all'} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => { setTab(t.key); setPage(1); }}>
            {t.label}
            {t.key && counts[t.key] ? ` (${counts[t.key]})` : ''}
          </button>
        ))}
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, email or phone..." />
      </Toolbar>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Goal</th>
                <th>Status</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <Inbox size={22} style={{ opacity: 0.5, marginBottom: 8 }} />
                  <div>No requests in this view.</div>
                </td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>
                    <div>{r.email}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.phone || '—'}</div>
                  </td>
                  <td>{r.plan}</td>
                  <td style={{ maxWidth: 200, color: 'var(--text-secondary)' }}>{r.goal || '—'}</td>
                  <td><Badge type={STATUS_TYPE[r.status] || 'info'}>{r.status}</Badge></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(r.createdAt)}</td>
                  <td>
                    {r.status === 'NEW' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-primary" onClick={() => openReview(r, 'APPROVED')}>
                          <Check size={13} /> Approve
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => openReview(r, 'REJECTED')}>
                          <X size={13} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {r.reviewedAt ? formatDate(r.reviewedAt) : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={total} limit={15} onPage={setPage} />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.decision === 'APPROVED' ? 'Approve' : 'Reject'} {modal.row.name}</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0 }}>
                {modal.decision === 'APPROVED'
                  ? `An email with the outcome goes to ${modal.row.email}.`
                  : `An email explaining the decision goes to ${modal.row.email}.`}
              </p>

              <div className="form-group">
                <label>Note to the applicant (optional)</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    modal.decision === 'APPROVED'
                      ? 'e.g. Bring a photo ID, we will set your first session for Thursday.'
                      : 'e.g. We are at capacity for Forge right now. Spark has an opening.'
                  }
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', padding: 10 }}
                />
              </div>

              {modal.decision === 'APPROVED' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                  <span>Create a member account and app login now</span>
                  <UserPlus size={14} style={{ opacity: 0.6 }} />
                </label>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setModal(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ width: 'auto' }}
                disabled={busy === modal.row.id}
                onClick={submitReview}
              >
                {busy === modal.row.id ? 'Saving...' : modal.decision === 'APPROVED' ? 'Approve & notify' : 'Reject & notify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}