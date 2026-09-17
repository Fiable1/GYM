import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Badge, PageHeader, Pagination, formatDate, statusColor } from '../../components/UI';
import { Wrench } from 'lucide-react';

export default function WorkOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/work-orders?page=${page}&limit=20`)
      .then(r => { setOrders(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title="Work Orders" />
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
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}