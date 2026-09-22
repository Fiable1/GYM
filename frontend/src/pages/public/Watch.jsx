import { useMemo, useState } from 'react';
import { FLOOR_VIDEOS } from '../../data/videos';
import { Search } from 'lucide-react';

export default function Watch() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(FLOOR_VIDEOS[0]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FLOOR_VIDEOS;
    return FLOOR_VIDEOS.filter((v) => `${v.title} ${v.channel} ${v.blurb}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="section">
      <div className="section-head">
        <h2>Watch like YouTube. Train like you mean it.</h2>
        <p>Free on every device. Press play, then put the phone down and do the work — the club is waiting either way.</p>
      </div>
      <div className="yt-search">
        <Search size={16} style={{ alignSelf: 'center', color: 'var(--site-muted)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sessions, strength, boxing, recover…"
          aria-label="Search videos"
        />
      </div>
      <div className="yt-stage">
        <div>
          <div className="yt-player">
            <iframe
              title={active.title}
              src={`https://www.youtube.com/embed/${active.id}?rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, textTransform: 'uppercase', marginTop: 16 }}>
            {active.title}
          </h3>
          <p style={{ color: 'var(--site-muted)', marginTop: 6 }}>{active.channel} · {active.blurb}</p>
        </div>
        <div className="yt-list">
          {list.map((v) => (
            <button
              type="button"
              key={v.id}
              className={`yt-item ${active.id === v.id ? 'active' : ''}`}
              onClick={() => setActive(v)}
            >
              <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" />
              <div>
                <h4>{v.title}</h4>
                <p>{v.channel}</p>
              </div>
            </button>
          ))}
          {list.length === 0 && <p style={{ color: 'var(--site-muted)' }}>No sessions match that search. Try “strength” or “restore”.</p>}
        </div>
      </div>
      <div className="yt-grid">
        {FLOOR_VIDEOS.map((v) => (
          <button type="button" className="yt-card" key={`card-${v.id}`} onClick={() => { setActive(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" />
            <div className="meta">
              <h4>{v.title}</h4>
              <p style={{ color: 'var(--site-muted)', fontSize: 13, marginTop: 6 }}>{v.blurb}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
