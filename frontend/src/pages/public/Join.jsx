import { useState } from 'react';
import Reveal from '../../components/Reveal';

export default function Join() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Forge',
    goal: 'I need my energy back',
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const leads = JSON.parse(localStorage.getItem('pf_leads') || '[]');
    leads.push({ ...form, at: new Date().toISOString() });
    localStorage.setItem('pf_leads', JSON.stringify(leads));
    setDone(true);
  };

  return (
    <section className="section">
      <div className="join-wrap">
        <Reveal>
          <p className="eyebrow">Free to start. Costly to postpone.</p>
          <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>Walk in as you are. Leave as someone who showed up.</h1>
          <p className="lead">
            Tell us who you are. We will hold a first session, a coach intro, and a plan that does not require a perfect week.
            The need you feel — the tightness, the lag, the “I used to be able to” — that is exactly why this form exists.
          </p>
        </Reveal>
        {done ? (
          <div className="success-panel">
            <p className="eyebrow">You’re in the pipeline</p>
            <h2 className="display" style={{ fontSize: 42 }}>The floor is expecting you.</h2>
            <p className="lead" style={{ margin: '12px auto 0' }}>
              A coach will reach out within a day. Until then, open Watch, pick a session, and refuse to wait for permission.
            </p>
          </div>
        ) : (
          <form className="join-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} required placeholder="Alex Rivera" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="you@email.com" />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={onChange} required placeholder="(555) 010-2040" />
            </div>
            <div className="form-group">
              <label htmlFor="plan">Membership pull</label>
              <select id="plan" name="plan" value={form.plan} onChange={onChange}>
                <option>Spark</option>
                <option>Forge</option>
                <option>Apex</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="goal">What do you need most?</label>
              <select id="goal" name="goal" value={form.goal} onChange={onChange}>
                <option>I need my energy back</option>
                <option>I need strength I can trust</option>
                <option>I need a room that holds me accountable</option>
                <option>I need to feel like myself again</option>
              </select>
            </div>
            <button className="btn-ember" type="submit" style={{ width: '100%' }}>Send my name to the floor</button>
          </form>
        )}
      </div>
    </section>
  );
}
