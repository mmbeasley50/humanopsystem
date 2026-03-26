import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { G, DIM, CREAM, CARD, DOMAINS, ALL_FACTORS, type Profile, type Scores, type CheckIn } from './constants';
import { getDomainScore, getOverall, scoreColor, label, streak, checkedToday } from './helpers';
import { Card, Mono } from './shared';

interface DashTabProps {
  profile: Profile;
  scores: Scores;
  checkIns: CheckIn[];
}

export default function DashTab({ profile, scores, checkIns }: DashTabProps) {
  const overall = getOverall(scores);
  const str = streak(checkIns);
  const done = checkedToday(checkIns);
  const worst = ALL_FACTORS.map(f => ({ ...f, score: scores[f.id] ?? 5 })).sort((a, b) => a.score - b.score)[0];
  const radarData = DOMAINS.map(d => ({ domain: d.name, score: getDomainScore(d.id, scores) }));
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const Tick = ({ x, y, payload }: any) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={DIM} fontSize={10} fontFamily="DM Mono, monospace">
      {payload.value}
    </text>
  );

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: DIM }}>{greet},</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300 }}>{profile?.name}</div>
      </div>

      <Card style={{ textAlign: 'center', marginBottom: 16 }}>
        <Mono style={{ marginBottom: 14 }}>Flourishing Score</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 88, color: scoreColor(overall), lineHeight: 1, transition: 'color 0.3s' }}>
          {overall}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: scoreColor(overall), letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>
          {label(overall)}
        </div>
        {str > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'rgba(201,168,76,0.09)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 20, padding: '5px 14px' }}>
            <span>🔥</span>
            <Mono style={{ fontSize: 10, color: G }}>{str} day streak</Mono>
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Mono style={{ marginBottom: 12 }}>6 Domain Overview</Mono>
        <ResponsiveContainer width="100%" height={210}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis dataKey="domain" tick={<Tick />} />
            <Radar dataKey="score" stroke={G} fill={G} fillOpacity={0.12} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {worst && (
        <div style={{ background: CARD, border: '1px solid rgba(192,57,43,0.18)', borderLeft: '3px solid #C0392B', borderRadius: '0 12px 12px 0', padding: '18px 20px', marginBottom: 16 }}>
          <Mono style={{ color: '#E57373', marginBottom: 8 }}>Priority Focus</Mono>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: CREAM, marginBottom: 6 }}>{worst.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: DIM }}>{worst.shortDomain}</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: scoreColor(worst.score) }}>{worst.score}/10</span>
          </div>
        </div>
      )}

      <Card style={{ marginBottom: 16 }}>
        <Mono style={{ marginBottom: 16 }}>Domain Scores</Mono>
        {DOMAINS.map(d => {
          const s = getDomainScore(d.id, scores);
          return (
            <div key={d.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: '#D4CBBA' }}>{d.name}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: scoreColor(s) }}>{s}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${s * 10}%`, background: d.color, borderRadius: 2, transition: 'width 0.5s' }} />
              </div>
            </div>
          );
        })}
      </Card>

      {!done && (
        <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.16)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: G, marginBottom: 2 }}>Daily check-in pending</div>
            <div style={{ fontSize: 12, color: DIM }}>Track today → Today tab</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: G, boxShadow: `0 0 8px ${G}` }} />
        </div>
      )}
    </div>
  );
}
