import Reveal from '../../components/Reveal';
import { Link } from 'react-router-dom';

const CLASSES = [
  {
    time: '05:30',
    name: 'Sunrise Forge',
    tag: 'Strength',
    copy: 'The day has not started arguing yet. Lift while the world is quiet.',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  },
  {
    time: '07:00',
    name: 'Engine HIIT',
    tag: 'Conditioning',
    copy: 'Twenty-eight minutes. No spare thought. You will remember you have a pulse.',
    img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
  },
  {
    time: '12:15',
    name: 'Lunch Combat',
    tag: 'Boxing',
    copy: 'Empty the inbox rage into the bag. Return as someone who can lead the afternoon.',
    img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80',
  },
  {
    time: '18:00',
    name: 'Prime Strength',
    tag: 'Barbell',
    copy: 'The session people protect on their calendar because everything else gets easier after.',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
  },
  {
    time: '19:30',
    name: 'Flow Restore',
    tag: 'Mobility',
    copy: 'Unwind the armor. Sleep like you earned it — because you did.',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80',
  },
  {
    time: '21:00',
    name: 'Night Run Club',
    tag: 'Endurance',
    copy: 'City lights, shared miles, and the kind of tired that feels like pride.',
    img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=900&q=80',
  },
];

export default function PublicClasses() {
  return (
    <section className="section">
      <div className="section-head">
        <h2>A slate that refuses to let you coast.</h2>
        <p>Coach-led, clock-honest, built for people who need a reason to show up and a room that will notice if they do not.</p>
      </div>
      <div className="programs">
        {CLASSES.map((c, i) => (
          <Reveal key={c.name} delay={i * 70}>
            <article className="program">
              <div className="program-photo"><img src={c.img} alt={c.name} /></div>
              <div className="program-body">
                <p className="eyebrow">{c.time} · {c.tag}</p>
                <h3>{c.name}</h3>
                <p>{c.copy}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <div style={{ marginTop: 36, textAlign: 'center' }}>
        <Link to="/join" className="btn-ember">Lock in a class</Link>
      </div>
    </section>
  );
}
