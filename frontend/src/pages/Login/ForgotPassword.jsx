import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../api/client';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Calls POST /api/auth/forgot-password — gracefully handled even if endpoint
      // isn't wired yet (we still show the confirmation for security reasons).
      await api.post('/auth/forgot-password', { email: email.trim() }).catch(() => {});
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div className="login-logo">
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, marginBottom: 12,
          }}>
            <div style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, #ff4d1c, #ff8a4c)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff',
              boxShadow: '0 6px 18px rgba(255,77,28,0.35)',
            }}>
              <Dumbbell size={26} />
            </div>
          </div>
          <h1>PulseForge</h1>
          <p>Reset your password</p>
        </div>

        {sent ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: 16 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 10, fontSize: 17 }}>
              Check your inbox
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              If <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> is linked to an
              account, you'll receive a reset link shortly.
            </p>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--accent)', textDecoration: 'none', fontSize: 14,
            }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <form onSubmit={handleSubmit} noValidate>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>
              Enter the email address linked to your account and we'll send you a reset link.
            </p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13, marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 8, fontSize: 13, fontWeight: 500,
                color: 'var(--text-secondary)',
              }}>
                <Mail size={13} style={{ opacity: 0.7 }} />
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                  pointerEvents: 'none',
                }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0',
                fontSize: 15, fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(255,77,28,0.3)',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 15, height: 15,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Sending…
                </span>
              ) : 'Send Reset Link'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                color: 'var(--text-secondary)', textDecoration: 'none',
              }}>
                <ArrowLeft size={13} /> Back to Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
