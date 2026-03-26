import { useState, useEffect } from 'react';
import { DIM, CREAM, GREEN, G, type Scores, type CheckIn, type TodayPlan } from './constants';
import { scoreColor, label, checkedToday, bottomFactors, generateTodayPlan, storage } from './helpers';
import { Card, Mono, inp, btnStyle, ghost } from './shared';

interface TodayTabProps {
  scores: Scores;
  checkIns: CheckIn[];
  onAdd: (ci: CheckIn) => void;
  goals?: { id: string; title: string; category: string; active: boolean }[];
  onSaveGoal?: (title: string, category: string) => Promise<void>;
  onDeleteGoal?: (id: string) => Promise<void>;
}

export default function TodayTab({ scores, checkIns, onAdd, goals = [], onSaveGoal, onDeleteGoal }: TodayTabProps) {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [win, setWin] = useState('');
  const [miss, setMiss] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const [plan, setPlan] = useState<TodayPlan | null>(null);
  const [taskChecks, setTaskChecks] = useState<boolean[]>([false, false, false]);
  const [newGoal, setNewGoal] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const alreadyDone = checkedToday(checkIns);
  const todayCI = checkIns.find(ci => new Date(ci.date).toDateString() === new Date().toDateString());

  // Load or generate today plan
  useEffect(() => {
    const raw = storage.get('hos:todayplan');
    if (raw) {
      try {
        const saved = JSON.parse(raw) as TodayPlan;
        if (new Date(saved.date).toDateString() === new Date().toDateString()) {
          setPlan(saved);
          setTaskChecks(saved.actions.map(a => a.completed));
          return;
        }
      } catch { /* regenerate */ }
    }
    const newPlan = generateTodayPlan(scores);
    setPlan(newPlan);
    setTaskChecks(newPlan.actions.map(a => a.completed));
    storage.set('hos:todayplan', JSON.stringify(newPlan));
  }, [scores]);

  const toggleTask = (i: number) => {
    const next = [...taskChecks];
    next[i] = !next[i];
    setTaskChecks(next);
    if (plan) {
      const updated = { ...plan, actions: plan.actions.map((a, idx) => ({ ...a, completed: next[idx] })) };
      setPlan(updated);
      storage.set('hos:todayplan', JSON.stringify(updated));
    }
  };

  const submit = () => {
    onAdd({
      date: new Date().toISOString(),
      mood,
      energy,
      tasksCompleted: taskChecks,
      win: win.trim() || undefined,
      miss: miss.trim() || undefined,
      note: note.trim(),
    });
    setDone(true);
  };

  if (done || alreadyDone) {
    const ci = done ? { mood, energy, win, miss, note, tasksCompleted: taskChecks } : todayCI;
    const completedCount = (ci as any)?.tasksCompleted?.filter(Boolean)?.length ?? 0;
    const totalTasks = (ci as any)?.tasksCompleted?.length ?? 3;
    return (
      <div style={{ padding: '28px 20px', textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>✓</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: CREAM, marginBottom: 12 }}>Checked in</div>
        {ci && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: scoreColor(ci.mood), lineHeight: 1 }}>{ci.mood}</div>
                <Mono style={{ fontSize: 9, marginTop: 4 }}>Mood</Mono>
              </div>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: scoreColor(ci.energy ?? ci.mood), lineHeight: 1 }}>{ci.energy ?? ci.mood}</div>
                <Mono style={{ fontSize: 9, marginTop: 4 }}>Energy</Mono>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Mono style={{ fontSize: 9, marginBottom: 6 }}>Tasks Completed</Mono>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: completedCount === totalTasks ? GREEN : G }}>
                {completedCount}/{totalTasks}
              </div>
            </div>
            {(ci as any)?.win && (
              <div style={{ fontSize: 13, color: GREEN, marginBottom: 8 }}>
                <strong>Win:</strong> {(ci as any).win}
              </div>
            )}
            {(ci as any)?.miss && (
              <div style={{ fontSize: 13, color: '#E07A5F', marginBottom: 8 }}>
                <strong>Miss:</strong> {(ci as any).miss}
              </div>
            )}
            {ci.note && (
              <div style={{ fontSize: 14, color: DIM, fontStyle: 'italic', maxWidth: 280, margin: '0 auto', marginTop: 12 }}>"{ci.note}"</div>
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
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: CREAM, fontWeight: 300 }}>Today</div>
      </div>

      {/* Today Plan */}
      {plan && (
        <>
          <div style={{ background: 'rgba(201,168,76,0.06)', border: `1px solid rgba(201,168,76,0.2)`, borderLeft: `3px solid ${G}`, borderRadius: '0 12px 12px 0', padding: '18px 20px', marginBottom: 14 }}>
            <Mono style={{ color: G, marginBottom: 8 }}>Primary Focus</Mono>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: CREAM, marginBottom: 6 }}>{plan.primaryFocus.factor}</div>
            <p style={{ fontSize: 13, color: DIM, lineHeight: 1.65 }}>{plan.primaryFocus.insight}</p>
          </div>

          <Card style={{ marginBottom: 14 }}>
            <Mono style={{ marginBottom: 14 }}>Non-Negotiables</Mono>
            {plan.actions.map((a, i) => (
              <button key={i} onClick={() => toggleTask(i)}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%',
                  marginBottom: i < plan.actions.length - 1 ? 14 : 0,
                  paddingBottom: i < plan.actions.length - 1 ? 14 : 0,
                  borderBottom: i < plan.actions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0,
                  ...(i < plan.actions.length - 1 ? { paddingBottom: 14 } : {}),
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: taskChecks[i] ? `2px solid ${GREEN}` : '2px solid rgba(255,255,255,0.15)',
                  background: taskChecks[i] ? 'rgba(82,183,136,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {taskChecks[i] && <span style={{ color: GREEN, fontSize: 14, lineHeight: 1 }}>✓</span>}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: CREAM, marginBottom: 3,
                    textDecoration: taskChecks[i] ? 'line-through' : 'none',
                    opacity: taskChecks[i] ? 0.5 : 1, transition: 'all 0.2s',
                  }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: DIM, lineHeight: 1.55 }}>{a.description}</div>
                </div>
              </button>
            ))}
          </Card>

          <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
            <Mono style={{ color: '#E57373', marginBottom: 6 }}>Avoid Today</Mono>
            <p style={{ fontSize: 13, color: '#D4CBBA', lineHeight: 1.6 }}>{plan.avoid}</p>
          </div>

          <div style={{ borderLeft: `2px solid ${G}`, paddingLeft: 16, marginBottom: 24, background: 'rgba(201,168,76,0.04)', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: CREAM, fontStyle: 'italic', lineHeight: 1.5 }}>
              "{plan.accountability}"
            </p>
          </div>
        </>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0 24px' }} />

      {/* Check-in form */}
      <div style={{ marginBottom: 20 }}>
        <Mono style={{ marginBottom: 8 }}>Daily Check-in</Mono>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: CREAM, fontWeight: 300 }}>How did today go?</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Card style={{ textAlign: 'center', padding: '14px 12px' }}>
          <Mono style={{ marginBottom: 10, fontSize: 9 }}>Mood</Mono>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, color: scoreColor(mood), lineHeight: 1, marginBottom: 2 }}>{mood}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: scoreColor(mood), letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>{label(mood)}</div>
          <input type="range" min={0} max={10} step={0.5} value={mood}
            style={{ '--pct': `${mood * 10}%` } as React.CSSProperties}
            onChange={e => { const v = parseFloat(e.target.value); setMood(v); e.currentTarget.style.setProperty('--pct', `${v * 10}%`); }}
          />
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px 12px' }}>
          <Mono style={{ marginBottom: 10, fontSize: 9 }}>Energy</Mono>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, color: scoreColor(energy), lineHeight: 1, marginBottom: 2 }}>{energy}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: scoreColor(energy), letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>{label(energy)}</div>
          <input type="range" min={0} max={10} step={0.5} value={energy}
            style={{ '--pct': `${energy * 10}%` } as React.CSSProperties}
            onChange={e => { const v = parseFloat(e.target.value); setEnergy(v); e.currentTarget.style.setProperty('--pct', `${v * 10}%`); }}
          />
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Mono style={{ marginBottom: 10 }}>One Win</Mono>
        <input type="text" value={win} onChange={e => setWin(e.target.value)}
          placeholder="What went right today?"
          style={{ ...inp, background: 'transparent', border: 'none', padding: 0, fontSize: 14, color: '#D4CBBA' }}
        />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Mono style={{ marginBottom: 10 }}>One Miss</Mono>
        <input type="text" value={miss} onChange={e => setMiss(e.target.value)}
          placeholder="What would you do differently?"
          style={{ ...inp, background: 'transparent', border: 'none', padding: 0, fontSize: 14, color: '#D4CBBA' }}
        />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Mono style={{ marginBottom: 10 }}>Reflection</Mono>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="What was today actually about?"
          style={{ ...inp, height: 70, background: 'transparent', border: 'none', padding: 0, fontSize: 14, color: '#D4CBBA', lineHeight: 1.65 }}
        />
      </Card>

      <button onClick={submit} style={{ ...btnStyle(true), marginBottom: 16 }}>Record Check-in →</button>

      {/* Goals Section */}
      {onSaveGoal && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0 24px' }} />
          <Mono style={{ marginBottom: 14 }}>Your Goals</Mono>
          {goals.filter(g => g.active).map(g => (
            <Card key={g.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: CREAM }}>{g.title}</div>
                <div style={{ fontSize: 11, color: DIM }}>{g.category}</div>
              </div>
              {onDeleteGoal && (
                <button onClick={() => onDeleteGoal(g.id)} style={{ background: 'none', border: 'none', color: DIM, cursor: 'pointer', fontSize: 16 }}>×</button>
              )}
            </Card>
          ))}
          {showGoalForm ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                type="text" value={newGoal} onChange={e => setNewGoal(e.target.value)}
                placeholder="New goal..." style={{ ...inp, flex: 1, padding: '10px 12px', fontSize: 13 }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newGoal.trim()) {
                    onSaveGoal(newGoal.trim(), 'general');
                    setNewGoal('');
                    setShowGoalForm(false);
                  }
                }}
                autoFocus
              />
              <button onClick={() => {
                if (newGoal.trim()) {
                  onSaveGoal(newGoal.trim(), 'general');
                  setNewGoal('');
                  setShowGoalForm(false);
                }
              }} style={{ ...btnStyle(!!newGoal.trim()), width: 60, padding: '10px', fontSize: 13 }}>Add</button>
            </div>
          ) : (
            <button onClick={() => setShowGoalForm(true)} style={{ ...ghost, marginTop: 8, fontSize: 13 }}>+ Add Goal</button>
          )}
        </div>
      )}
    </div>
  );
}
