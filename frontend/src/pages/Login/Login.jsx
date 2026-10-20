import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../components/toast';
import { Dumbbell, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

/* ─── tiny helpers ─────────────────────────────────────────── */
const isPhone = (v) => /^[+\d]/.test(v.trim());

export default function Login() {
  const [identifier, setIdentifier] = useState('fiablemunezero@gmail.com');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const u = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${u.firstName}!`);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const IdentifierIcon = isPhone(identifier) ? Phone : Mail;

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ width: '100%', maxWidth: 420 }}>

        {/* ── Logo ── */}
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
          <p>Welcome back — sign in to your PulseForge account.</p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Error banner */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠</span> {error}
            </div>
          )}

          {/* Email / Phone field */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              <IdentifierIcon size={13} style={{ opacity: 0.7 }} />
              {isPhone(identifier) ? 'Phone Number' : 'Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 13, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
                pointerEvents: 'none',
              }}>
                <IdentifierIcon size={16} />
              </span>
              <input
                type={isPhone(identifier) ? 'tel' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@example.com or +250 7xx xxx xxx"
                required
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              <Lock size={13} style={{ opacity: 0.7 }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 13, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
                pointerEvents: 'none',
              }}>
                <Lock size={16} />
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingLeft: 40, paddingRight: 44 }}
              />
              {/* Show / hide toggle */}
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                title={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 4,
                  color: showPw ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                  transition: 'color 0.2s',
                }}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 12,
                color: 'var(--accent)',
                textDecoration: 'none',
                opacity: 0.85,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = 1)}
              onMouseLeave={(e) => (e.target.style.opacity = 0.85)}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.03em',
              borderRadius: 'var(--radius-sm)',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(255,77,28,0.3)',
              transition: 'box-shadow 0.2s, opacity 0.2s',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{
                  width: 15, height: 15,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ← Back to the club site
            </Link>
          </p>
        </form>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}