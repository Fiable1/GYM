import { useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../../components/Reveal';

const PLANS = ['Spark', 'Forge', 'Apex'];

export default function Join() {
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Forge',
    goal: 'I need my energy back',
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus('Sending your request...');
    try {
      const res = await fetch('/api/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
        setError(msg || 'Something went wrong. Please try again.');
        setStatus('');
        return;
      }

      setDone(true);
      setStatus('');
    } catch {
      setError('Network error. Please check your connection and try again.');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section join-section">
      <div className="join-wrap">
        <Reveal>
          <p className="eyebrow">Start today</p>
          <h1 className="display" style={{ fontSize: 'clamp(38px, 5.5vw, 66px)' }}>
            One session. See the difference.
          </h1>
          <p className="lead">
            Tell us where to reach you. A coach sets your first session and sends every update to your inbox.
          </p>
          <ul className="join-points">
            <li>First session held for you</li>
            <li>Coach intro, no pressure</li>
            <li>Cancel anytime</li>
          </ul>
        </Reveal>

        {done ? (
          <div className="success-panel">
            <p className="eyebrow">Request received</p>
            <h2 className="display" style={{ fontSize: 40 }}>You are on the list.</h2>
            <p className="lead" style={{ margin: '12px auto 0' }}>
              Check <strong>{form.email}</strong> for confirmation. A coach will reach out within one business day.
            </p>
            <Link to="/classes" className="btn-ghost" style={{ marginTop: 24, display: 'inline-flex' }}>
              Browse classes while you wait
            </Link>
          </div>
        ) : (
          <form className="join-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                required
                minLength={2}
                placeholder="Alex Rivera"
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={onChange}
                required
                minLength={6}
                placeholder="(555) 010-2040"
                autoComplete="tel"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plan">Plan</label>
                <select id="plan" name="plan" value={form.plan} onChange={onChange}>
                  {PLANS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="goal">Main goal</label>
                <select id="goal" name="goal" value={form.goal} onChange={onChange}>
                  <option>Energy and stamina</option>
                  <option>Strength I can trust</option>
                  <option>Accountability</option>
                  <option>Feel like myself again</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="join-error" role="alert">{error}</p>
            )}

            <button className="btn-ember" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? (status || 'Sending...') : 'Claim my first session'}
            </button>
            <p className="join-fineprint">
              No card required. We only email you about your request.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}