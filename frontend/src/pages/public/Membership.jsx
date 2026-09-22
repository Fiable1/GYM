import { Link } from 'react-router-dom';
import Reveal from '../../components/Reveal';

const PLANS = [
  {
    name: 'Spark',
    price: '39',
    blurb: 'Start before you feel ready.',
    items: ['Off-peak floor access', '2 coach classes / week', 'App + Watch library', 'Guest day once a month'],
  },
  {
    name: 'Forge',
    price: '79',
    featured: true,
    blurb: 'The membership most lives actually need.',
    items: ['24/7 club access', 'Unlimited classes', '1 PT intro + monthly check-in', 'Recovery bay + Watch studio', 'Priority booking'],
  },
  {
    name: 'Apex',
    price: '149',
    blurb: 'For people who treat health like a career.',
    items: ['Everything in Forge', 'Weekly personal training', 'Body composition tracking', 'Guest privileges', 'Locker + kit'],
  },
];

export default function Membership() {
  return (
    <section className="section">
      <div className="section-head">
        <h2>Pay for the body you keep using.</h2>
        <p>Skipping this is not saving money. It is borrowing against energy, mood, and the years you still want to fill.</p>
      </div>
      <div className="plans">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 80}>
            <article className={`plan ${p.featured ? 'featured' : ''}`}>
              {p.featured && <p className="eyebrow">Most chosen</p>}
              <h3 className="display" style={{ fontSize: 36 }}>{p.name}</h3>
              <p>{p.blurb}</p>
              <div className="price">${p.price}<span> / mo</span></div>
              <ul>
                {p.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <Link to="/join" className={p.featured ? 'btn-ember' : 'btn-ghost'} style={{ width: '100%', animation: 'none' }}>
                I need {p.name}
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
