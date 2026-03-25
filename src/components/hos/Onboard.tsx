import { useState } from 'react';
import { G, DIM, CREAM, type Profile } from './constants';
import { Mono, inp, btnStyle, ghost } from './shared';

interface OnboardProps {
  onComplete: (profile: Profile) => void;
}

export default function Onboard({ onComplete }: OnboardProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [mission, setMission] = useState('');

  if (step === 0) return (
    <div style={{ height: '100dvh', minHeight: '-webkit-fill-available', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '80px 28px 56px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, color: G, fontStyle: 'italic', lineHeight: 1, marginBottom: 16 }}>HOS</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: DIM, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 48 }}>Human Operating System</div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: CREAM, lineHeight: 1.55, fontStyle: 'italic', maxWidth: 320, margin: '0 auto 20px' }}>
          "The system must make people more capable, not more dependent."
        </p>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.75, maxWidth: 300, margin: '0 auto' }}>
          Based on the IFF-6×20 framework — 6 domains, 20 measurable factors, built on 50+ years of flourishing research.
        </p>
      </div>
      <button onClick={() => setStep(1)} style={btnStyle(true)}>Begin Your Assessment →</button>
    </div>
  );

  if (step === 1) return (
    <div style={{ height: '100dvh', minHeight: '-webkit-fill-available', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 28px 56px' }}>
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: G, fontStyle: 'italic', marginBottom: 40 }}>HOS</div>
        <Mono style={{ marginBottom: 12 }}>01 — Your Name</Mono>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300, lineHeight: 1.2, marginBottom: 12 }}>What should we call you?</h2>
        <p style={{ fontSize: 14, color: DIM, marginBottom: 28, lineHeight: 1.7 }}>This is your personal operating system. It starts with you.</p>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="First name" style={inp} autoFocus
          onKeyDown={e => e.key === 'Enter' && name.trim().length > 1 && setStep(2)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => setStep(2)} disabled={name.trim().length < 2} style={btnStyle(name.trim().length >= 2)}>Continue →</button>
        <button onClick={() => setStep(0)} style={ghost}>← Back</button>
      </div>
    </div>
  );

  const ok = mission.trim().length > 15;
  return (
    <div style={{ height: '100dvh', minHeight: '-webkit-fill-available', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 28px 56px' }}>
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: G, fontStyle: 'italic', marginBottom: 40 }}>HOS</div>
        <Mono style={{ marginBottom: 12 }}>02 — Your Mission</Mono>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300, lineHeight: 1.2, marginBottom: 12 }}>What is your life about?</h2>
        <p style={{ fontSize: 14, color: DIM, marginBottom: 28, lineHeight: 1.7 }}>
          One honest sentence. Not impressive — true. What are you building with your life?
        </p>
        <textarea value={mission} onChange={e => setMission(e.target.value)}
          placeholder="e.g. To build systems that help humans flourish and become who they were created to be."
          style={{ ...inp, height: 110, paddingTop: 14, lineHeight: 1.6 }} autoFocus />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => onComplete({ name: name.trim(), mission: mission.trim() })} disabled={!ok} style={btnStyle(ok)}>
          Begin 20-Factor Assessment →
        </button>
        <button onClick={() => setStep(1)} style={ghost}>← Back</button>
      </div>
    </div>
  );
}
