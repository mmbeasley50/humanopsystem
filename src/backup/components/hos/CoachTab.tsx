import { useState, useEffect } from 'react';
import { G, DIM, CREAM, ALL_FACTORS, type Profile, type Scores } from './constants';
import { getOverall, scoreColor } from './helpers';
import { storage } from './helpers';
import { Card, Mono, btnStyle, ghost } from './shared';

interface CoachTabProps {
  profile: Profile;
  scores: Scores;
}

interface Coaching {
  overallRead: string;
  bottleneck?: { factor: string; score: number; insight: string };
  weeklyFocus: string;
  actions?: { title: string; description: string }[];
  truthTell?: string;
  todayMission?: string;
}

export default function CoachTab({ profile, scores }: CoachTabProps) {
  const [coaching, setCoaching] = useState<Coaching | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    const raw = storage.get('hos:coaching');
    if (raw) {
      try {
        const d = JSON.parse(raw);
        setCoaching(d.data);
        setUpdated(d.date);
      } catch { /* noop */ }
    }
  }, []);

  const analyze = async () => {
    setLoading(true);
    setErr(null);
    try {
      const factorScores = ALL_FACTORS.map(f => ({ ...f, score: scores[f.id] ?? 5 }));
      const sorted = [...factorScores].sort((a, b) => a.score - b.score);
      const worst = sorted[0];
      const overall = getOverall(scores);

      const parsed: Coaching = {
        overallRead: `Your overall flourishing score is ${overall}/10, placing you in the "${overall >= 7 ? 'Strong' : overall >= 5 ? 'Developing' : 'Struggling'}" range. ${worst.score < 5 ? `Your ${worst.name} score of ${worst.score}/10 is a clear area that needs attention.` : 'Your scores show a relatively balanced profile.'} Focus on your weakest areas for the highest leverage improvements.`,
        bottleneck: {
          factor: worst.name,
          score: worst.score,
          insight: `At ${worst.score}/10, ${worst.name} is your primary constraint. Improving this factor will have cascading positive effects across your other domains. This is where your attention will yield the greatest return.`,
        },
        weeklyFocus: `Dedicate 30 minutes daily this week specifically to improving your ${worst.name}. Track one concrete metric related to this factor each day.`,
        actions: sorted.slice(0, 3).map(f => ({
          title: `Improve ${f.shortDomain}`,
          description: `Your ${f.name} score is ${f.score}/10. Set one specific, measurable goal for this week and review progress daily.`,
        })),
        truthTell: overall < 6
          ? "You're not where you want to be, and the gap between your current reality and your mission is real. But awareness is the first step."
          : "You're doing better than you think, but comfort is the enemy of growth. Don't let good enough become your ceiling.",
        todayMission: `${profile.name}, your one job today: move ${worst.name} from ${worst.score} toward ${Math.min(worst.score + 1, 10)}. One action. No excuses.`,
      };

      setCoaching(parsed);
      setUpdated(new Date().toISOString());
      storage.set('hos:coaching', JSON.stringify({ data: parsed, date: new Date().toISOString() }));
    } catch {
      setErr('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Mono style={{ marginBottom: 8 }}>AI Coach</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300 }}>Your Insight</div>
      </div>

      {!coaching && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 16px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#D4CBBA', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>
            "Your life doesn't improve randomly — it improves by fixing the right factors in the right order."
          </div>
          <p style={{ fontSize: 13, color: DIM, lineHeight: 1.75, marginBottom: 40 }}>
            Your AI coach analyzes all 20 factor scores and identifies your highest-leverage opportunity right now.
          </p>
          <button onClick={analyze} style={btnStyle(true)}>Analyze My Scores →</button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: G, fontStyle: 'italic', marginBottom: 16 }}>Analyzing...</div>
          <p style={{ fontSize: 13, color: DIM, lineHeight: 1.7 }}>Reading your 20 factors and identifying your leverage point.</p>
        </div>
      )}

      {err && (
        <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#E57373', marginBottom: 16 }}>{err}</p>
          <button onClick={analyze} style={btnStyle(true)}>Try Again</button>
        </div>
      )}

      {coaching && !loading && (
        <div>
          {updated && <Mono style={{ marginBottom: 16, fontSize: 9 }}>Last updated: {new Date(updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Mono>}

          {coaching.todayMission && (
            <div style={{ background: 'rgba(82,183,136,0.08)', border: `1px solid rgba(82,183,136,0.25)`, borderRadius: 12, padding: '16px 20px', marginBottom: 14 }}>
              <Mono style={{ color: '#52B788', marginBottom: 8 }}>Today's Mission</Mono>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: CREAM, lineHeight: 1.55, fontStyle: 'italic' }}>
                "{coaching.todayMission}"
              </p>
            </div>
          )}

          <Card style={{ marginBottom: 14 }}>
            <Mono style={{ marginBottom: 10 }}>Where You Are</Mono>
            <p style={{ fontSize: 15, color: '#D4CBBA', lineHeight: 1.75 }}>{coaching.overallRead}</p>
          </Card>

          <div style={{ background: '#111110', border: `1px solid rgba(201,168,76,0.28)`, borderLeft: `3px solid ${G}`, borderRadius: '0 12px 12px 0', padding: '18px 20px', marginBottom: 14 }}>
            <Mono style={{ color: G, marginBottom: 8 }}>Your Bottleneck</Mono>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: CREAM }}>{coaching.bottleneck?.factor}</div>
              {coaching.bottleneck?.score != null && (
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: scoreColor(coaching.bottleneck.score) }}>{coaching.bottleneck.score}/10</div>
              )}
            </div>
            <p style={{ fontSize: 14, color: '#D4CBBA', lineHeight: 1.7 }}>{coaching.bottleneck?.insight}</p>
          </div>

          <div style={{ background: 'rgba(82,183,136,0.07)', border: '1px solid rgba(82,183,136,0.2)', borderRadius: 12, padding: '18px 20px', marginBottom: 14 }}>
            <Mono style={{ color: '#52B788', marginBottom: 8 }}>This Week's Focus</Mono>
            <p style={{ fontSize: 15, color: '#D4CBBA', lineHeight: 1.65 }}>{coaching.weeklyFocus}</p>
          </div>

          <Card style={{ marginBottom: 14 }}>
            <Mono style={{ marginBottom: 18 }}>3 Actions This Week</Mono>
            {coaching.actions?.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: i < 2 ? 16 : 0, paddingBottom: i < 2 ? 16 : 0, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: 'rgba(201,168,76,0.25)', lineHeight: 1, minWidth: 22 }}>{i + 1}</div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: CREAM, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: DIM, lineHeight: 1.65 }}>{a.description}</div>
                </div>
              </div>
            ))}
          </Card>

          {coaching.truthTell && (
            <div style={{ borderLeft: `2px solid ${G}`, paddingLeft: 16, marginBottom: 24, background: 'rgba(201,168,76,0.04)', padding: '14px 18px', borderRadius: '0 8px 8px 0' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: CREAM, fontStyle: 'italic', lineHeight: 1.6 }}>
                "{coaching.truthTell}"
              </p>
            </div>
          )}

          <button onClick={analyze} style={{ ...ghost, marginBottom: 24 }}>↺ Refresh Analysis</button>
        </div>
      )}
    </div>
  );
}
