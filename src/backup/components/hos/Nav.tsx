import { G, DIM, type CheckIn } from './constants';
import { checkedToday } from './helpers';
import { IcoHome, IcoCoach, IcoToday, IcoProgress, IcoProfile } from './shared';

interface NavProps {
  tab: string;
  onChange: (tab: string) => void;
  checkIns: CheckIn[];
}

export default function Nav({ tab, onChange, checkIns }: NavProps) {
  const pending = !checkedToday(checkIns);
  const tabs = [
    { id: 'home', label: 'Home', Icon: IcoHome },
    { id: 'coach', label: 'Coach', Icon: IcoCoach },
    { id: 'today', label: 'Today', Icon: IcoToday, dot: pending },
    { id: 'progress', label: 'Progress', Icon: IcoProgress },
    { id: 'profile', label: 'Profile', Icon: IcoProfile },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, zIndex: 100,
      background: 'rgba(9,9,7,0.96)', backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(201,168,76,0.09)',
      display: 'flex', alignItems: 'center',
      padding: '8px 0 18px',
    }}>
      {tabs.map(({ id, label, Icon, dot }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => onChange(id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '7px 0', color: active ? G : DIM, transition: 'color 0.2s', position: 'relative' }}
          >
            <Icon active={active} />
            {dot && <div style={{ position: 'absolute', top: 4, right: '50%', transform: 'translateX(10px)', width: 6, height: 6, borderRadius: '50%', background: G, boxShadow: `0 0 6px ${G}` }} />}
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
