import { X } from 'lucide-react';

export function Modal({ open, title, onClose, children, footer, wide }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={wide ? { maxWidth: '720px' } : {}} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Badge({ type = 'neutral', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

export function Loading({ height = '200px' }) {
  return (
    <div className="empty-state" style={{ padding: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );
}

export function EmptyState({ icon, title, message }) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function PageHeader({ title, children }) {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

export function Pagination({ page, total, limit, onPage }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) {
      items.push(i);
    } else if (items[items.length - 1] !== '...') {
      items.push('...');
    }
  }
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
      {items.map((i, idx) =>
        i === '...' ? <span key={`e${idx}`} style={{ color: 'var(--text-muted)' }}>...</span>
          : <button key={i} className={i === page ? 'active' : ''} onClick={() => onPage(i)}>{i}</button>
      )}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}

export function StatCard({ icon, iconBg, value, label, change, changeDir = 'up' }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
        {change && <span className={`stat-change stat-${changeDir}`}>{change}</span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-input">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="text"
        className="form-group"
        style={{ padding: '9px 14px 9px 36px', width: 240 }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function formatMoney(v) {
  if (v == null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v) || 0);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function statusColor(status) {
  const map = {
    ACTIVE: 'success', INACTIVE: 'neutral', PENDING: 'warning', SUSPENDED: 'danger',
    PAID: 'success', PARTIAL: 'warning', UNPAID: 'danger', OVERDUE: 'danger', CANCELLED: 'neutral',
    OPEN: 'info', IN_PROGRESS: 'warning', COMPLETED: 'success',
    HEALTHY: 'success', WARNING: 'warning', OFFLINE: 'danger', FAULT: 'danger',
    BOOKED: 'info', WAITLIST: 'warning', ATTENDED: 'success', CANCELLED: 'neutral',
    LOW: 'warning', MEDIUM: 'warning', HIGH: 'danger', NONE: 'success',
    OPERATIONAL: 'success', MAINTENANCE: 'warning', OFFLINE: 'danger',
    CRITICAL: 'danger', NORMAL: 'success', SCHEDULED: 'info',
  };
  return map[status] || 'neutral';
}

export function avatarInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}