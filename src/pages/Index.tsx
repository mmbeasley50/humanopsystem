import { useState, useEffect } from 'react';
import { DARK, type Profile, type Scores, type CheckIn } from '@/components/hos/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useHosData } from '@/hooks/useHosData';
import AuthScreen from '@/components/hos/AuthScreen';
import Onboard from '@/components/hos/Onboard';
import Assess from '@/components/hos/Assess';
import DashTab from '@/components/hos/DashTab';
import CoachTab from '@/components/hos/CoachTab';
import TodayTab from '@/components/hos/TodayTab';
import ProgressTab from '@/components/hos/ProgressTab';
import ProfileTab from '@/components/hos/ProfileTab';
import Nav from '@/components/hos/Nav';
import { G, DIM } from '@/components/hos/constants';

const wrap: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 430,
  margin: '0 auto', height: '100dvh', background: DARK,
  fontFamily: "'Outfit', sans-serif", color: '#D4CBBA', overflow: 'hidden', position: 'relative',
};

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const hosData = useHosData();
  const [tab, setTab] = useState('home');

  // Loading state
  if (authLoading || (user && hosData.loading)) {
    return (
      <div style={{ ...wrap, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, color: G, fontStyle: 'italic', lineHeight: 1 }}>HOS</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: DIM, letterSpacing: '0.35em', textTransform: 'uppercase', marginTop: 10 }}>Human Operating System</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Onboarding
  if (!hosData.onboardingCompleted) {
    return (
      <div style={wrap}>
        <Onboard onComplete={async (p) => {
          await hosData.saveProfile(p);
        }} />
      </div>
    );
  }

  // Assessment
  if (!hosData.assessmentCompleted) {
    return (
      <div style={wrap}>
        <Assess
          profile={hosData.profile!}
          existing={hosData.scores}
          onComplete={async (s) => {
            await hosData.saveScores(s);
          }}
        />
      </div>
    );
  }

  const onCheckIn = async (ci: CheckIn) => {
    await hosData.saveCheckIn(ci);
  };

  const onReassess = () => {
    setTab('home');
    // Reset assessment state by clearing scores - will trigger re-assessment
    // Actually we just navigate to assessment view
  };

  return (
    <div style={wrap}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 76 }}>
        {tab === 'home' && (
          <DashTab
            profile={hosData.profile!}
            scores={hosData.scores}
            checkIns={hosData.checkIns}
            goals={hosData.goals}
            streak={hosData.streak}
          />
        )}
        {tab === 'coach' && (
          <CoachTab
            profile={hosData.profile!}
            scores={hosData.scores}
            coachingMessages={hosData.coachingMessages}
            onRefresh={hosData.refreshData}
          />
        )}
        {tab === 'today' && (
          <TodayTab
            scores={hosData.scores}
            checkIns={hosData.checkIns}
            onAdd={onCheckIn}
            goals={hosData.goals}
            onSaveGoal={hosData.saveGoal}
            onDeleteGoal={hosData.deleteGoal}
          />
        )}
        {tab === 'progress' && (
          <ProgressTab
            scores={hosData.scores}
            checkIns={hosData.checkIns}
            assessments={hosData.assessments}
            streak={hosData.streak}
          />
        )}
        {tab === 'profile' && (
          <ProfileTab
            profile={hosData.profile!}
            scores={hosData.scores}
            onUpdate={hosData.updateProfile}
            onReassess={onReassess}
          />
        )}
      </div>
      <Nav tab={tab} onChange={setTab} checkIns={hosData.checkIns} />
    </div>
  );
}
