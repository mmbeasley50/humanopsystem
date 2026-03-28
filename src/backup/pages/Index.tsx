import { useState, useEffect } from 'react';
import { G, DIM, DARK, CREAM, type Profile, type Scores, type CheckIn } from '@/components/hos/constants';
import { getOverall } from '@/components/hos/helpers';
import Onboard from '@/components/hos/Onboard';
import Assess from '@/components/hos/Assess';
import DashTab from '@/components/hos/DashTab';
import CoachTab from '@/components/hos/CoachTab';
import TodayTab from '@/components/hos/TodayTab';
import ProgressTab from '@/components/hos/ProgressTab';
import ProfileTab from '@/components/hos/ProfileTab';
import Nav from '@/components/hos/Nav';

const wrap: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 430,
  margin: '0 auto', height: '100vh', background: DARK,
  fontFamily: "'Outfit', sans-serif", color: '#D4CBBA', overflow: 'hidden', position: 'relative',
};

export default function Index() {
  const [state, setState] = useState<'loading' | 'onboarding' | 'assessment' | 'main'>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Scores>({});
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [tab, setTab] = useState('home');

  useEffect(() => {
    let p: Profile | null = null;
    let s: Scores = {};
    let c: CheckIn[] = [];
    try { const r = storage.get('hos:profile'); if (r) p = JSON.parse(r); } catch {}
    try { const r = storage.get('hos:scores'); if (r) s = JSON.parse(r); } catch {}
    try { const r = storage.get('hos:checkins'); if (r) c = JSON.parse(r); } catch {}
    setProfile(p);
    setScores(s);
    setCheckIns(c);
    if (!p) setState('onboarding');
    else if (Object.keys(s).length < 20) setState('assessment');
    else setState('main');
  }, []);

  const save = (k: string, v: any) => storage.set(k, JSON.stringify(v));

  const onProfile = (p: Profile) => { setProfile(p); save('hos:profile', p); setState('assessment'); };
  const onScores = (s: Scores) => {
    setScores(s); save('hos:scores', s);
    // Save assessment to history
    saveAssessment(s);
    const ci: CheckIn = { date: new Date().toISOString(), mood: getOverall(s), energy: getOverall(s), note: 'Baseline assessment.' };
    const c = [...checkIns, ci]; setCheckIns(c); save('hos:checkins', c);
    setState('main');
  };
  const onCheckIn = (ci: CheckIn) => { const c = [...checkIns, ci]; setCheckIns(c); save('hos:checkins', c); };
  const onProfileUpdate = (p: Profile) => { setProfile(p); save('hos:profile', p); };
  const onReassess = () => { setTab('home'); setState('assessment'); };

  if (state === 'loading') return (
    <div style={{ ...wrap, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, color: G, fontStyle: 'italic', lineHeight: 1 }}>HOS</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: DIM, letterSpacing: '0.35em', textTransform: 'uppercase', marginTop: 10 }}>Human Operating System</div>
      </div>
    </div>
  );
  if (state === 'onboarding') return <div style={wrap}><Onboard onComplete={onProfile} /></div>;
  if (state === 'assessment') return <div style={wrap}><Assess profile={profile!} existing={scores} onComplete={onScores} /></div>;

  return (
    <div style={wrap}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 76 }}>
        {tab === 'home' && <DashTab profile={profile!} scores={scores} checkIns={checkIns} />}
        {tab === 'coach' && <CoachTab profile={profile!} scores={scores} coachingMessages={[]} onRefresh={async () => {}} />}
        {tab === 'today' && <TodayTab scores={scores} checkIns={checkIns} onAdd={onCheckIn} />}
        {tab === 'progress' && <ProgressTab scores={scores} checkIns={checkIns} />}
        {tab === 'profile' && <ProfileTab profile={profile!} scores={scores} onUpdate={onProfileUpdate} onReassess={onReassess} />}
      </div>
      <Nav tab={tab} onChange={setTab} checkIns={checkIns} />
    </div>
  );
}
