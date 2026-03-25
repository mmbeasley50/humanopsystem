import { useState } from 'react';
import { G, DIM, CREAM, RED, type Profile, type Scores } from './constants';
import { Card, Mono, inp, btnStyle, ghost } from './shared';

interface ProfileTabProps {
  profile: Profile;
  scores: Scores;
  onUpdate: (p: Profile) => void;
  onReassess: () => void;
}

export default function ProfileTab({ profile, onUpdate, onReassess }: ProfileTabProps) {
  const [editing, setEditing] = useState(false);
  const [n, setN] = useState(profile?.name || '');
  const [m, setM] = useState(profile?.mission || '');
  const [confirmReassess, setConfirmReassess] = useState(false);

  return (
    <div style={{ padding: '28px 20px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Mono style={{ marginBottom: 8 }}>Profile</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300 }}>{profile?.name}</div>
      </div>

      <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <Mono style={{ color: G, marginBottom: 12 }}>Your Mission</Mono>
        {editing ? (
          <>
            <input value={n} onChange={e => setN(e.target.value)} style={{ ...inp, marginBottom: 10, fontSize: 14 }} placeholder="Your name" />
            <textarea value={m} onChange={e => setM(e.target.value)} style={{ ...inp, height: 90, paddingTop: 12, fontSize: 14, lineHeight: 1.6 }} placeholder="Your mission" />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={() => { onUpdate({ name: n.trim(), mission: m.trim() }); setEditing(false); }} style={{ ...btnStyle(true), flex: 2, padding: '12px' }}>Save</button>
              <button onClick={() => setEditing(false)} style={{ ...ghost, flex: 1, padding: '12px' }}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: CREAM, lineHeight: 1.65, fontStyle: 'italic', marginBottom: 16 }}>
              "{profile?.mission}"
            </p>
            <button onClick={() => { setEditing(true); setN(profile.name); setM(profile.mission); }} style={ghost}>Edit</button>
          </>
        )}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Mono style={{ marginBottom: 14 }}>Personal Operating Rules</Mono>
        {[
          'Never trust your motives just because they feel noble.',
          'Never let your platform outgrow your ethics.',
          'Never confuse admiration with legitimacy.',
          'Stay close to normal human life.',
          'Keep one foot in service at all times.',
        ].map((rule, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(201,168,76,0.25)', lineHeight: 1, minWidth: 18 }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: '#D4CBBA', lineHeight: 1.65 }}>{rule}</div>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Mono style={{ marginBottom: 10 }}>About IFF-6×20</Mono>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.75 }}>
          The Integrated Flourishing Framework synthesizes research from Harvard Human Flourishing, PERMA, Self-Determination Theory, Gallup, OECD, and the World Happiness Report into 6 core domains and 20 measurable factors.
        </p>
      </Card>

      <Card style={{ marginBottom: 32 }}>
        <Mono style={{ marginBottom: 10 }}>Assessment</Mono>
        <p style={{ fontSize: 13, color: DIM, marginBottom: 16, lineHeight: 1.65 }}>
          Retake to update your baseline. Recommended every 30–90 days. Check-in history is preserved.
        </p>
        {!confirmReassess ? (
          <button onClick={() => setConfirmReassess(true)} style={ghost}>Retake Assessment</button>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: '#E57373', marginBottom: 12 }}>Your check-in history will be preserved.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onReassess} style={{ ...btnStyle(true), flex: 2, padding: '12px', background: RED }}>Yes, Retake</button>
              <button onClick={() => setConfirmReassess(false)} style={{ ...ghost, flex: 1, padding: '12px' }}>Cancel</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
