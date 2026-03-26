import { useState, useEffect } from 'react';
import { DARK, CREAM, DIM, ALL_FACTORS, DOMAINS, type Profile, type Scores } from './constants';
import { scoreColor, label } from './helpers';
import { Mono, btnStyle, ghost } from './shared';

interface AssessProps {
  profile: Profile;
  existing: Scores;
  onComplete: (scores: Scores) => void;
}

export default function Assess({ existing, onComplete }: AssessProps) {
  const [cur, setCur] = useState(0);
  const [vals, setVals] = useState<Scores>({ ...existing });
  const [local, setLocal] = useState(existing[ALL_FACTORS[0]?.id] ?? 5);

  useEffect(() => { setLocal(vals[ALL_FACTORS[cur]?.id] ?? 5); }, [cur, vals]);

  const factor = ALL_FACTORS[cur];
  const domain = DOMAINS.find(d => d.id === factor.domainId)!;
  const pct = ((cur + 1) / 20) * 100;

  const go = (dir: number) => {
    const updated = { ...vals, [factor.id]: local };
    setVals(updated);
    if (dir > 0 && cur < 19) setCur(cur + 1);
    else if (dir > 0) onComplete(updated);
    else if (dir < 0 && cur > 0) setCur(cur - 1);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: DARK }}>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: domain.color, transition: 'width 0.35s ease' }} />
      </div>

      <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: domain.color }} />
          <Mono>{domain.name}</Mono>
        </div>
        <Mono>{cur + 1} / 20</Mono>
      </div>

      <div style={{ flex: 1, padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: CREAM, fontWeight: 300, lineHeight: 1.2, marginBottom: 14 }}>
            {factor.name}
          </h2>
          <p style={{ fontSize: 14, color: DIM, lineHeight: 1.75, marginBottom: 36 }}>{factor.q}</p>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, color: scoreColor(local), lineHeight: 1, transition: 'color 0.2s' }}>
              {Number.isInteger(local) ? local : local.toFixed(1)}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: scoreColor(local), letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 6, transition: 'color 0.2s' }}>
              {label(local)}
            </div>
          </div>

          <input type="range" min={0} max={10} step={0.5} value={local}
            style={{ '--pct': `${local * 10}%` } as React.CSSProperties}
            onChange={e => { const v = parseFloat(e.target.value); setLocal(v); e.currentTarget.style.setProperty('--pct', `${v * 10}%`); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {['Critical', 'Developing', 'Strong', 'Thriving'].map(l => <Mono key={l} style={{ fontSize: 9 }}>{l}</Mono>)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {cur > 0 && <button onClick={() => go(-1)} style={{ ...ghost, flex: 1 }}>← Back</button>}
          <button onClick={() => go(1)} style={{ ...btnStyle(true), flex: cur > 0 ? 2 : 1 }}>
            {cur < 19 ? 'Next →' : 'Complete Assessment →'}
          </button>
        </div>
      </div>
    </div>
  );
}
