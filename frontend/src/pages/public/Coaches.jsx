import Reveal from '../../components/Reveal';
import { Link } from 'react-router-dom';

const COACHES = [
  {
    name: 'Maya Chen',
    role: 'Strength lead',
    img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80',
    line: 'She will not let a half-rep become your personality.',
  },
  {
    name: 'Jordan Hale',
    role: 'Combat & engine',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    line: 'The voice that turns “I can’t” into round two.',
  },
  {
    name: 'Priya Nair',
    role: 'Restore & mobility',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    line: 'Because surviving the week is not the same as living it.',
  },
  {
    name: 'Chris Velez',
    role: 'Performance PT',
    img: 'https://images.unsplash.com/photo-1571731956672-f2b9c0dd3d4e?auto=format&fit=crop&w=800&q=80',
    line: 'Numbers, honesty, and a plan that fits a real calendar.',
  },
];

export default function Coaches() {
  return (
    <section className="section">
      <div className="section-head">
        <h2>Coaches who will not let you disappear.</h2>
        <p>You do not need more information. You need someone who notices when you skip, and a method that still works on your worst week.</p>
      </div>
      <div className="coaches">
        {COACHES.map((c, i) => (
          <Reveal key={c.name} delay={i * 80}>
            <article className="coach">
              <img src={c.img} alt={c.name} />
              <div className="caption">
                <p className="eyebrow">{c.role}</p>
                <h3>{c.name}</h3>
                <p>{c.line}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Link to="/join" className="btn-ember">Train with us</Link>
      </div>
    </section>
  );
}
