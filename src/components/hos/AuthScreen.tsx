import { useState } from 'react';
import { G, DIM, CREAM, DARK } from './constants';
import { Mono, inp, btnStyle, ghost } from './shared';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: err } = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    if (err) {
      setError(err.message);
    } else if (mode === 'signup') {
      setSuccess('Check your email to confirm your account.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      width: '100%', maxWidth: 430, margin: '0 auto', height: '100dvh',
      background: DARK, fontFamily: "'Outfit', sans-serif", color: '#D4CBBA',
      padding: '80px 28px 56px',
    }}>
      <div>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, color: G, fontStyle: 'italic', lineHeight: 1, marginBottom: 16 }}>HOS</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: DIM, letterSpacing: '0.4em', textTransform: 'uppercase' }}>Human Operating System</div>
        </div>

        <Mono style={{ marginBottom: 12 }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Mono>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" style={inp} autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" style={inp}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#E57373', marginBottom: 16, textAlign: 'center' }}>{error}</div>
        )}
        {success && (
          <div style={{ fontSize: 13, color: '#52B788', marginBottom: 16, textAlign: 'center' }}>{success}</div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !email.trim() || !password.trim()}
          style={btnStyle(!loading && !!email.trim() && !!password.trim())}
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>
        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null); }}
          style={ghost}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
