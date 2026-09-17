import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Badge, PageHeader, Pagination, formatDate, formatDateTime } from '../../components/UI';
import { Shield } from 'lucide-react';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/audit?page=${page}&limit=20`)
      .then(r => { setLogs(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title="Audit Log" />
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Action</th><th>Entity</th><th>Entity ID</th><th>By</th><th>Time</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No audit entries</td></tr>
              ) : logs.map(l => (
                <tr key={l.id}>
                  <td><Badge type={l.action === 'DELETE' ? 'danger' : l.action === 'UPDATE' ? 'warning' : 'info'}>{l.action || 'CREATE'}</Badge></td>
                  <td style={{ fontWeight: 600 }}>{l.entityType || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{l.entityId?.slice(0, 12) || '—'}...</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{l.userId?.slice(0, 8) || '—'}...</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDateTime(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}