import { useState } from 'react';
import { G, DIM, CREAM, type Profile, type Scores } from './constants';
import { getOverall, scoreColor } from './helpers';
import { Card, Mono, btnStyle, ghost } from './shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CoachTabProps {
  profile: Profile;
  scores: Scores;
  coachingMessages: { id: string; message: string; created_at: string; checkin_id: string | null }[];
  onRefresh: () => Promise<void>;
}

export default function CoachTab({ profile, scores, coachingMessages, onRefresh }: CoachTabProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [latestMessage, setLatestMessage] = useState<string | null>(
    coachingMessages.length > 0 ? coachingMessages[0].message : null
  );
  const [latestDate, setLatestDate] = useState<string | null>(
    coachingMessages.length > 0 ? coachingMessages[0].created_at : null
  );

  const analyze = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-coaching', {
        body: { checkin_id: null },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLatestMessage(data.message);
      setLatestDate(new Date().toISOString());
      await onRefresh();
    } catch (e: any) {
      setErr(e.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const overall = getOverall(scores);

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Mono style={{ marginBottom: 8 }}>AI Coach</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300 }}>Your Insight</div>
      </div>

      {!latestMessage && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 16px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#D4CBBA', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>
            "Your life doesn't improve randomly — it improves by fixing the right factors in the right order."
          </div>
          <p style={{ fontSize: 13, color: DIM, lineHeight: 1.75, marginBottom: 40 }}>
            Your AI coach analyzes your scores, check-ins, and goals to give you direct, actionable coaching.
          </p>
          <button onClick={analyze} style={btnStyle(true)}>Get AI Coaching →</button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: G, fontStyle: 'italic', marginBottom: 16 }}>Analyzing...</div>
          <p style={{ fontSize: 13, color: DIM, lineHeight: 1.7 }}>Reading your data and generating real coaching.</p>
        </div>
      )}

      {err && (
        <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#E57373', marginBottom: 16 }}>{err}</p>
          <button onClick={analyze} style={btnStyle(true)}>Try Again</button>
        </div>
      )}

      {latestMessage && !loading && (
        <div>
          {latestDate && <Mono style={{ marginBottom: 16, fontSize: 9 }}>Last updated: {new Date(latestDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Mono>}

          <Card style={{ marginBottom: 14 }}>
            <Mono style={{ color: G, marginBottom: 10 }}>AI Coaching</Mono>
            <p style={{ fontSize: 15, color: '#D4CBBA', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{latestMessage}</p>
          </Card>

          <button onClick={analyze} style={{ ...ghost, marginBottom: 14 }}>↺ Refresh Coaching</button>

          {/* Previous messages */}
          {coachingMessages.length > 1 && (
            <div style={{ marginTop: 10 }}>
              <Mono style={{ marginBottom: 12 }}>Previous Coaching</Mono>
              {coachingMessages.slice(1, 5).map(m => (
                <Card key={m.id} style={{ marginBottom: 10 }}>
                  <Mono style={{ fontSize: 9, marginBottom: 8 }}>
                    {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Mono>
                  <p style={{ fontSize: 13, color: DIM, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                    {m.message.length > 200 ? m.message.slice(0, 200) + '...' : m.message}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
