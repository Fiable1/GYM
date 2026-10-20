import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('Missing reset token. Request a new reset link.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="login-logo">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, marginBottom: 12,
          }}>
            <div style={{
              width: 52, height: 52, background: 'linear-gradient(135deg, #ff4d1c, #ff8a4c)',
              borderRadius: 14, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff',
              boxShadow: '0 6px 18px rgba(255,77,28,0.35)',
            }}>
              <Dumbbell size={26} />
            </div>
          </div>
          <h1>PulseForge</h1>
          <p>Choose a new password</p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: 16 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 10, fontSize: 17 }}>
              Password updated
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              Your password has been reset. Redirecting to sign in…
            </p>
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                color: '#f87171', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                <Lock size={13} style={{ opacity: 0.7 }} /> New Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} title={showPw ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: showPw ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                <Lock size={13} style={{ opacity: 0.7 }} /> Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading || !token}
              style={{ width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 600, borderRadius: 'var(--radius-sm)', boxShadow: loading ? 'none' : '0 4px 14px rgba(255,77,28,0.3)' }}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
              <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Request a new link
              </Link>
            </p>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}