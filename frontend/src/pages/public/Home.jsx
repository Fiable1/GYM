import { Link } from 'react-router-dom';
import Reveal from '../../components/Reveal';
import { FLOOR_VIDEOS } from '../../data/videos';
import { ArrowRight, Play } from 'lucide-react';

const HERO =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80';
const STRENGTH =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80';
const CLASSROOM =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1400&q=80';
const BOXING =
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1400&q=80';
const YOGA =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80';

const WORDS = [
  'Stop waiting for Monday',
  'Your body is asking for this',
  'Comfort is costing you years',
  'The floor is open. Are you?',
  'Strength is a decision',
  'You need this more than you think',
];

export default function Home() {
  const featured = FLOOR_VIDEOS[0];

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src={HERO} alt="Athletes training on the PulseForge floor" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">PulseForge Athletic Club</p>
          <h1 className="display">
            You already know
            <br />
            you need this.
          </h1>
          <p className="lead">
            The version of you that sleeps deeper, walks taller, and stops negotiating with the alarm is built here —
            not someday. Today. The floor does not care about your excuses. It will meet you anyway.
          </p>
          <div className="hero-actions">
            <Link to="/join" className="btn-ember">Claim your first session</Link>
            <Link to="/watch" className="btn-ghost"><Play size={14} /> Watch the floor</Link>
          </div>
        </div>
      </section>

      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...WORDS, ...WORDS].map((w, i) => (
            <span key={`${w}-${i}`}>{w} ·</span>
          ))}
        </div>
      </div>

      <div className="stats-row">
        {[
          ['24/7', 'Access when the doubt is loudest'],
          ['12k+', 'Members who stopped waiting'],
          ['180+', 'Coach-led sessions a week'],
          ['0', 'Judgment at the door'],
        ].map(([n, l]) => (
          <div className="stat-block" key={n}>
            <strong>{n}</strong>
            <span>{l}</span>
          </div>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>If you feel the ache, that is the invitation.</h2>
          <p>Fatigue, stiffness, the quiet fear that time is getting ahead of you — that is not dramatic. That is data. PulseForge is the response.</p>
        </div>
        <div className="need-grid">
          <Reveal>
            <article className="need-card">
              <img src={STRENGTH} alt="Heavy lifting" />
              <div className="inner">
                <h3>Your future body is impatient</h3>
                <p>Every unused day is a vote for weaker bones, slower recovery, and a smaller life. Strength is not vanity. It is how you stay in the story.</p>
              </div>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <article className="need-card">
              <img src={CLASSROOM} alt="Group training" />
              <div className="inner">
                <h3>You were not meant to do this alone</h3>
                <p>Willpower fades. A room full of people who showed up anyway does not. Walk in tired. Leave claimed.</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>The floor</h2>
          <Link to="/classes" className="btn-ghost">See the full slate <ArrowRight size={14} /></Link>
        </div>
        <div className="programs">
          {[
            { img: STRENGTH, title: 'Forge Strength', copy: 'Barbell, breath, and honest numbers. Build the engine that carries your actual life.' },
            { img: BOXING, title: 'Combat Conditioning', copy: 'When stress has a face, give it a bag, a round, and a finish.' },
            { img: YOGA, title: 'Restore', copy: 'Mobility, down-shift, and the kind of quiet that makes tomorrow possible.' },
          ].map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <article className="program">
                <div className="program-photo"><img src={p.img} alt={p.title} /></div>
                <div className="program-body">
                  <h3>{p.title}</h3>
                  <p>{p.copy}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>Watch. Then get on the floor.</h2>
          <Link to="/watch" className="btn-ghost">Open the studio</Link>
        </div>
        <div className="yt-stage">
          <div className="yt-player">
            <iframe
              title={featured.title}
              src={`https://www.youtube.com/embed/${featured.id}?rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="yt-list">
            {FLOOR_VIDEOS.slice(0, 4).map((v) => (
              <Link to="/watch" className="yt-item" key={v.id}>
                <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" />
                <div>
                  <h4>{v.title}</h4>
                  <p>{v.channel}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ textAlign: 'center' }}>
        <Reveal>
          <p className="eyebrow">Last chance is a story. This is a door.</p>
          <h2 className="display" style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}>
            Come in hungry.
            <br />
            Leave necessary.
          </h2>
          <p className="lead" style={{ margin: '0 auto 28px' }}>
            Membership is not a luxury. It is the cheapest way to buy back energy, confidence, and years you still want to use.
          </p>
          <Link to="/join" className="btn-ember">I am done waiting</Link>
        </Reveal>
      </section>
    </>
  );
}
