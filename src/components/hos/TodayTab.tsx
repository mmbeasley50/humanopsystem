import { useState } from 'react';
import { DIM, CREAM, type Scores, type CheckIn } from './constants';
import { scoreColor, label, checkedToday, bottomFactors } from './helpers';
import { Card, Mono, inp, btnStyle } from './shared';

interface TodayTabProps {
  scores: Scores;
  checkIns: CheckIn[];
  onAdd: (ci: CheckIn) => void;
}

export default function TodayTab({ scores, checkIns, onAdd }: TodayTabProps) {
  const [mood, setMood] = useState(7);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const alreadyDone = checkedToday(checkIns);
  const todayCI = checkIns.find(ci => new Date(ci.date).toDateString() === new Date().toDateString());
  const bottom = bottomFactors(scores, 3);

  const submit = async () => {
    await onAdd({ date: new Date().toISOString(), mood, note: note.trim() });
    setDone(true);
  };

  if (done || alreadyDone) {
    const ci = done ? { mood, note } : todayCI;
    return (
      <div style={{ padding: '28px 20px', textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>✓</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: CREAM, marginBottom: 12 }}>Checked in</div>
        {ci && (
          <>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, color: scoreColor(ci.mood), marginBottom: 6 }}>{ci.mood}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: DIM, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>{label(ci.mood)}</div>
            {ci.note && (
              <div style={{ fontSize: 14, color: DIM, fontStyle: 'italic', maxWidth: 280, margin: '0 auto' }}>"{ci.note}"</div>
            )}
          </>
        )}
        <p style={{ fontSize: 13, color: DIM, marginTop: 32 }}>Keep showing up. That's the work.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Mono style={{ marginBottom: 8 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300 }}>Daily Check-in</div>
      </div>

      <Card style={{ marginBottom: 16, textAlign: 'center' }}>
        <Mono style={{ marginBottom: 16 }}>Overall Energy & Mood Today</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, color: scoreColor(mood), lineHeight: 1, transition: 'color 0.2s', marginBottom: 4 }}>{mood}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: scoreColor(mood), letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20, transition: 'color 0.2s' }}>{label(mood)}</div>
        <input type="range" min={0} max={10} step={0.5} value={mood}
          style={{ '--pct': `${mood * 10}%` } as React.CSSProperties}
          onChange={e => { const v = parseFloat(e.target.value); setMood(v); e.currentTarget.style.setProperty('--pct', `${v * 10}%`); }}
        />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Mono style={{ marginBottom: 12 }}>One Sentence Reflection</Mono>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="What was today actually about?"
          style={{ ...inp, height: 80, background: 'transparent', border: 'none', padding: 0, fontSize: 15, color: '#D4CBBA', lineHeight: 1.65 }}
        />
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Mono style={{ marginBottom: 14 }}>Your Current Focus Areas</Mono>
        {bottom.map(f => (
          <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#D4CBBA' }}>{f.name}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: scoreColor(f.score) }}>{f.score}/10</span>
          </div>
        ))}
        <div style={{ fontSize: 12, color: DIM, marginTop: 8, lineHeight: 1.6 }}>Your 3 lowest factors from your assessment.</div>
      </Card>

      <button onClick={submit} style={{ ...btnStyle(true), marginBottom: 24 }}>Record Check-in →</button>
    </div>
  );
}
