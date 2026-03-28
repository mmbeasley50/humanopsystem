import { DOMAINS, ALL_FACTORS, GREEN, G, RED, FACTOR_ACTIONS, type Scores, type CheckIn, type TodayPlan, type Assessment } from './constants';

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

export const getDomainScoresMap = (scores: Scores): Record<string, number> => {
  const map: Record<string, number> = {};
  DOMAINS.forEach(d => { map[d.id] = getDomainScore(d.id, scores); });
  return map;
};

export const label = (s: number): string =>
  s >= 8.5 ? 'Thriving' : s >= 7 ? 'Strong' : s >= 5 ? 'Developing' : s >= 3 ? 'Struggling' : 'Critical';

export const scoreColor = (s: number): string =>
  s >= 8 ? GREEN : s >= 6 ? G : s >= 4 ? '#E07A5F' : RED;

export const bottomFactors = (scores: Scores, n = 3) =>
  ALL_FACTORS.map(f => ({ ...f, score: scores[f.id] ?? 5 })).sort((a, b) => a.score - b.score).slice(0, n);

export const checkedToday = (cis: CheckIn[]): boolean =>
  cis.some(ci => new Date(ci.date).toDateString() === new Date().toDateString());

// Fixed streak logic using proper timestamp comparison
export const streak = (cis: CheckIn[]): number => {
  if (!cis.length) return 0;
  const uniqueDates = [...new Set(cis.map(ci => {
    const d = new Date(ci.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const DAY = 86400000;

  if (uniqueDates[0] < todayMs - DAY) return 0;

  let count = 0;
  let expected = uniqueDates[0] === todayMs ? todayMs : todayMs - DAY;

  for (const dateMs of uniqueDates) {
    if (dateMs === expected) {
      count++;
      expected -= DAY;
    } else if (dateMs < expected) {
      break;
    }
  }
  return count;
};

// Generate deterministic Today Plan from lowest factors
export const generateTodayPlan = (scores: Scores): TodayPlan => {
  const bottom = bottomFactors(scores, 3);
  const primary = bottom[0];
  const primaryAction = FACTOR_ACTIONS[primary.id];

  const actions = bottom.map(f => {
    const mapping = FACTOR_ACTIONS[f.id];
    return {
      title: f.name,
      description: mapping?.action ?? `Improve your ${f.name.toLowerCase()} with focused effort today.`,
      completed: false,
    };
  });

  return {
    date: new Date().toISOString(),
    primaryFocus: {
      factor: primary.name,
      insight: `At ${primary.score}/10, ${primary.name} is your biggest constraint. Improving this will unlock progress across your other domains.`,
    },
    actions,
    avoid: primaryAction?.avoid ?? 'Avoid behaviors that undermine your weakest area.',
    accountability: `Today I will focus on ${primary.name} because it is my #1 constraint at ${primary.score}/10.`,
  };
};
