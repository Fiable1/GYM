import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Badge, PageHeader, Pagination, SearchInput, Toolbar, formatDate, statusColor } from '../../components/UI';
import { Bell, Send, Mail, MessageSquare } from 'lucide-react';
import { toast } from '../../components/toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('notifications');

  const load = () => {
    setLoading(true);
    const url = tab === 'notifications'
      ? `/notifications?page=${page}&limit=15&search=${search}`
      : `/notification-templates?page=${page}&limit=15&search=${search}`;
    api.get(url)
      .then(r => {
        const data = r.data.data || [];
        if (tab === 'notifications') setNotifications(data);
        else setTemplates(data);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search, tab]);

  const sendTest = async (templateId) => {
    try {
      await api.post(`/notifications`, { templateId, channel: 'IN_APP', title: 'Test', body: 'Test notification' });
      toast.success('Notification sent');
    } catch (e) { toast.error('Failed to send'); }
  };

  return (
    <div>
      <PageHeader title="Notifications" />

      <div className="tabs">
        <button className={`tab ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>
          <Bell size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Notifications
        </button>
        <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
          <Mail size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Templates
        </button>
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={`Search ${tab}...`} />
      </Toolbar>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              {tab === 'notifications' ? (
                <tr><th>Title</th><th>Channel</th><th>Recipient</th><th>Status</th><th>Sent At</th></tr>
              ) : (
                <tr><th>Name</th><th>Channel</th><th>Subject</th><th>Actions</th></tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : tab === 'notifications' ? (
                notifications.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No notifications</td></tr>
                ) : notifications.map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>{n.title}</td>
                    <td><Badge type="info">{n.channel || 'IN_APP'}</Badge></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{n.recipientId?.slice(0, 8) || '—'}...</td>
                    <td><Badge type={n.status === 'SENT' ? 'success' : n.status === 'FAILED' ? 'danger' : 'warning'}>{n.status || 'PENDING'}</Badge></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(n.sentAt)}</td>
                  </tr>
                ))
              ) : (
                templates.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No templates</td></tr>
                ) : templates.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td><Badge type="info">{t.channel || 'EMAIL'}</Badge></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.subject || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => sendTest(t.id)}>
                        <Send size={13} /> Send Test
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} total={total} limit={15} onPage={setPage} />
    </div>
  );
}