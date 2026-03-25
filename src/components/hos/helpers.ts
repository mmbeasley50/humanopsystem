import { DOMAINS, ALL_FACTORS, GREEN, G, RED, type Scores, type CheckIn } from './constants';

export const getDomainScore = (id: string, scores: Scores): number => {
  const d = DOMAINS.find(x => x.id === id);
  if (!d) return 0;
  const v = d.factors.map(f => scores[f.id] ?? 5);
  return +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1);
};

export const getOverall = (scores: Scores): number => {
  if (!scores || !Object.keys(scores).length) return 0;
  const v = ALL_FACTORS.map(f => scores[f.id] ?? 0);
  return +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1);
};

export const label = (s: number): string =>
  s >= 8.5 ? 'Thriving' : s >= 7 ? 'Strong' : s >= 5 ? 'Developing' : s >= 3 ? 'Struggling' : 'Critical';

export const scoreColor = (s: number): string =>
  s >= 8 ? GREEN : s >= 6 ? G : s >= 4 ? '#E07A5F' : RED;

export const bottomFactors = (scores: Scores, n = 3) =>
  ALL_FACTORS.map(f => ({ ...f, score: scores[f.id] ?? 5 })).sort((a, b) => a.score - b.score).slice(0, n);

export const checkedToday = (cis: CheckIn[]): boolean =>
  cis.some(ci => new Date(ci.date).toDateString() === new Date().toDateString());

export const streak = (cis: CheckIn[]): number => {
  if (!cis.length) return 0;
  const dates = [...new Set(cis.map(ci => new Date(ci.date).toDateString()))].sort().reverse();
  let s = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  let currentDate = cur;
  for (const ds of dates) {
    const d = new Date(ds);
    d.setHours(0, 0, 0, 0);
    if (Math.round((currentDate.getTime() - d.getTime()) / 86400000) <= 1) {
      s++;
      currentDate = d;
    } else break;
  }
  return s;
};

export const storage = {
  get: (key: string) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch { /* noop */ }
  },
};
