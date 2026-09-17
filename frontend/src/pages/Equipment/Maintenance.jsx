import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Badge, PageHeader, Pagination, formatDate, statusColor } from '../../components/UI';
import { Wrench } from 'lucide-react';

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/maintenance?page=${page}&limit=20`)
      .then(r => { setItems(r.data.data || []); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title="Maintenance Schedules" />
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Schedule ID</th><th>Asset</th><th>Type</th><th>Frequency</th><th>Next Due</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : items.map(m => (
                <tr key={m.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.id?.slice(0, 8)}...</td>
                  <td>{m.equipmentAssetId?.slice(0, 8) || '—'}...</td>
                  <td><Badge type="info">{m.type || 'PREVENTIVE'}</Badge></td>
                  <td>{m.frequency || 'MONTHLY'}</td>
                  <td>{formatDate(m.nextDueDate)}</td>
                  <td><Badge type={statusColor(m.status)}>{m.status || 'SCHEDULED'}</Badge></td>
                </tr>
              ))}
              {items.length === 0 && !loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No maintenance schedules</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={total} limit={20} onPage={setPage} />
    </div>
  );
}