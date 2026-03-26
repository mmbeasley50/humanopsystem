import React from 'react';
import { CARD, BORDER, DIM, CREAM, G } from './constants';

// Shared inline style objects
export const inp: React.CSSProperties = {
  width: '100%', background: '#171614',
  border: '1px solid rgba(201,168,76,0.22)', borderRadius: 10,
  padding: '14px 16px', color: CREAM, fontSize: 15,
  fontFamily: "'Outfit', sans-serif", outline: 'none',
};

export const btnStyle = (on: boolean): React.CSSProperties => ({
  width: '100%', padding: '16px', borderRadius: 10, border: 'none',
  background: on ? G : 'rgba(201,168,76,0.12)',
  color: on ? '#0A0908' : DIM,
  fontSize: 15, fontWeight: 500, cursor: on ? 'pointer' : 'default',
  fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em',
  transition: 'all 0.2s',
});

export const ghost: React.CSSProperties = {
  width: '100%', padding: '13px', borderRadius: 10,
  background: 'transparent', color: DIM,
  border: '1px solid rgba(255,255,255,0.07)',
  fontSize: 14, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
};

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style = {} }) => (
  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', ...style }}>
    {children}
  </div>
);

export const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style = {} }) => (
  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: DIM, letterSpacing: '0.22em', textTransform: 'uppercase', ...style }}>
    {children}
  </div>
);

// Nav Icons
export const IcoHome: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
export const IcoCoach: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
  </svg>
);
export const IcoToday: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
export const IcoProgress: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
export const IcoProfile: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
