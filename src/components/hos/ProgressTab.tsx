import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { G, DIM, CREAM, CARD, BORDER, DOMAINS, type Scores, type CheckIn, type Assessment } from './constants';
import { getDomainScore, getOverall, scoreColor, streak, getAssessments } from './helpers';
import { Card, Mono } from './shared';

interface ProgressTabProps {
  scores: Scores;
  checkIns: CheckIn[];
  assessments?: Assessment[];
  streak?: { current: number; longest: number };
}

export default function ProgressTab({ scores, checkIns, assessments: propAssessments, streak: streakData }: ProgressTabProps) {
  const [viewHistory, setViewHistory] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const assessments = propAssessments ?? getAssessments();

  const overall = getOverall(scores);
  const chartData = checkIns.slice(-21).map(ci => ({
    label: new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: ci.mood,
    energy: ci.energy ?? ci.mood,
  }));
  const days = new Set(checkIns.map(ci => new Date(ci.date).toDateString())).size;
  const str = streakData?.current ?? streak(checkIns);

  const CTip = ({ active, payload, label: l }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1C1B17', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontSize: 10, color: DIM, marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>{l}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  };

  // Assessment detail view
  if (selectedAssessment) {
    const prevIdx = assessments.indexOf(selectedAssessment);
    const prev = prevIdx > 0 ? assessments[prevIdx - 1] : null;
    const radarCurrent = DOMAINS.map(d => ({
      domain: d.name,
      current: selectedAssessment.domainScores[d.id] ?? 0,
      ...(prev ? { previous: prev.domainScores[d.id] ?? 0 } : {}),
    }));
    const Tick = ({ x, y, payload }: any) => (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={DIM} fontSize={9} fontFamily="DM Mono, monospace">
        {payload.value}
      </text>
    );

    return (
      <div style={{ padding: '28px 20px 0' }}>
        <button onClick={() => setSelectedAssessment(null)} style={{ background: 'none', border: 'none', color: G, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 14, marginBottom: 20, padding: 0 }}>
          ← Back to Progress
        </button>
        <Mono style={{ marginBottom: 8 }}>Assessment</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: CREAM, fontWeight: 300, marginBottom: 6 }}>
          {new Date(selectedAssessment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: scoreColor(selectedAssessment.overall), marginBottom: 20 }}>
          {selectedAssessment.overall}
        </div>

        {prev && (
          <Card style={{ marginBottom: 16 }}>
            <Mono style={{ marginBottom: 12 }}>Comparison with Previous</Mono>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarCurrent} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="domain" tick={<Tick />} />
                <Radar name="Previous" dataKey="previous" stroke="#706860" fill="#706860" fillOpacity={0.08} strokeWidth={1} strokeDasharray="4 4" />
                <Radar name="Current" dataKey="current" stroke={G} fill={G} fillOpacity={0.12} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 2, background: '#706860' }} />
                <Mono style={{ fontSize: 8 }}>Previous</Mono>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 2, background: G }} />
                <Mono style={{ fontSize: 8 }}>This Assessment</Mono>
              </div>
            </div>
          </Card>
        )}

        <Card style={{ marginBottom: 24 }}>
          <Mono style={{ marginBottom: 16 }}>All Factor Scores</Mono>
          {DOMAINS.map(d => {
            const ds = selectedAssessment.domainScores[d.id] ?? 0;
            return (
              <div key={d.id} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: CREAM }}>{d.fullName}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: scoreColor(ds) }}>{ds}</div>
                </div>
                {d.factors.map(f => {
                  const s = selectedAssessment.scores[f.id] ?? 0;
                  return (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, paddingLeft: 10 }}>
                      <div style={{ fontSize: 11, color: DIM, flex: 1 }}>{f.name}</div>
                      <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${s * 10}%`, background: d.color, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: scoreColor(s), width: 18, textAlign: 'right' }}>{s}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Card>
      </div>
    );
  }

  // Assessment history list
  if (viewHistory) {
    return (
      <div style={{ padding: '28px 20px 0' }}>
        <button onClick={() => setViewHistory(false)} style={{ background: 'none', border: 'none', color: G, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 14, marginBottom: 20, padding: 0 }}>
          ← Back to Progress
        </button>
        <Mono style={{ marginBottom: 8 }}>Assessment History</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: CREAM, fontWeight: 300, marginBottom: 24 }}>
          Past Assessments
        </div>
        {assessments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: DIM, fontSize: 13 }}>No assessments recorded yet.</div>
        ) : (
          assessments.slice().reverse().map((a, i) => (
            <button key={i} onClick={() => setSelectedAssessment(a)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 20px',
                marginBottom: 10, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: CREAM, marginBottom: 4 }}>
                  {new Date(a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <Mono style={{ fontSize: 9 }}>
                  {i === 0 && assessments.length > 1 ? 'Latest' : i === assessments.length - 1 ? 'Baseline' : `Assessment ${assessments.length - i}`}
                </Mono>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: scoreColor(a.overall) }}>
                {a.overall}
              </div>
            </button>
          ))
        )}
      </div>
    );
  }

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
        <Mono style={{ marginBottom: 14 }}>Mood & Energy Over Time</Mono>
        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: DIM, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: DIM, fontSize: 9 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<CTip />} />
              <ReferenceLine y={overall} stroke={G} strokeDasharray="4 4" strokeOpacity={0.35} />
              <Line name="Mood" type="monotone" dataKey="mood" stroke={G} strokeWidth={2} dot={{ fill: G, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line name="Energy" type="monotone" dataKey="energy" stroke="#52B788" strokeWidth={1.5} dot={{ fill: '#52B788', r: 2, strokeWidth: 0 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 0', color: DIM, fontSize: 13 }}>
            Complete check-ins daily to see your trend.
          </div>
        )}
      </Card>

      {assessments.length > 0 && (
        <button onClick={() => setViewHistory(true)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
            background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.16)',
            borderRadius: 12, padding: '16px 20px', marginBottom: 16, cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: G, marginBottom: 2 }}>Assessment History</div>
            <div style={{ fontSize: 12, color: DIM }}>{assessments.length} assessment{assessments.length !== 1 ? 's' : ''} recorded</div>
          </div>
          <span style={{ color: G, fontSize: 18 }}>→</span>
        </button>
      )}

      <Card style={{ marginBottom: 24 }}>
        <Mono style={{ marginBottom: 20 }}>Current Scores by Domain</Mono>
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
