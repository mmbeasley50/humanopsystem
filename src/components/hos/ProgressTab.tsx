import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';
import { G, DIM, CREAM, CARD, BORDER, DOMAINS, type Scores, type CheckIn } from './constants';
import { getDomainScore, getOverall, scoreColor, streak } from './helpers';
import { Card, Mono } from './shared';

interface ProgressTabProps {
  scores: Scores;
  checkIns: CheckIn[];
}

export default function ProgressTab({ scores, checkIns }: ProgressTabProps) {
  const overall = getOverall(scores);
  const chartData = checkIns.slice(-21).map(ci => ({
    label: new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: ci.mood,
  }));
  const days = new Set(checkIns.map(ci => new Date(ci.date).toDateString())).size;
  const str = streak(checkIns);

  const CTip = ({ active, payload, label: l }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1C1B17', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontSize: 10, color: DIM, marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>{l}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: G }}>{payload[0].value}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Mono style={{ marginBottom: 8 }}>Progress</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300 }}>Your Journey</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[{ v: days, l: 'Days Tracked' }, { v: overall, l: 'Baseline' }, { v: `${str}d`, l: 'Streak' }].map(s => (
          <div key={s.l} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: G, lineHeight: 1, marginBottom: 6 }}>{s.v}</div>
            <Mono style={{ fontSize: 9 }}>{s.l}</Mono>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom: 16, paddingRight: 12 }}>
        <Mono style={{ marginBottom: 14 }}>Mood / Energy Over Time</Mono>
        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: DIM, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: DIM, fontSize: 9 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<CTip />} />
              <ReferenceLine y={overall} stroke={G} strokeDasharray="4 4" strokeOpacity={0.35} />
              <Line type="monotone" dataKey="mood" stroke={G} strokeWidth={2} dot={{ fill: G, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 0', color: DIM, fontSize: 13 }}>
            Complete check-ins daily to see your trend.
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Mono style={{ marginBottom: 20 }}>Assessment Scores by Domain</Mono>
        {DOMAINS.map(d => {
          const s = getDomainScore(d.id, scores);
          return (
            <div key={d.id} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: CREAM }}>{d.fullName}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: scoreColor(s) }}>{s}</div>
              </div>
              {d.factors.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, paddingLeft: 10 }}>
                  <div style={{ fontSize: 12, color: DIM, flex: 1 }}>{f.name}</div>
                  <div style={{ width: 70, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${(scores[f.id] ?? 0) * 10}%`, background: d.color, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: scoreColor(scores[f.id] ?? 0), width: 20, textAlign: 'right' }}>{scores[f.id] ?? 0}</div>
                </div>
              ))}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
