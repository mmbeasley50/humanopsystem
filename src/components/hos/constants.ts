// HOS Design Tokens (CSS values for inline styles)
export const G = '#C9A84C';
export const DARK = '#090907';
export const CARD = '#111110';
export const CARD2 = '#181714';
export const TEXT = '#D4CBBA';
export const DIM = '#706860';
export const CREAM = '#F0EBE0';
export const BORDER = 'rgba(201,168,76,0.13)';
export const GREEN = '#52B788';
export const RED = '#C0392B';

export interface Factor {
  id: number;
  name: string;
  q: string;
}

export interface Domain {
  id: string;
  name: string;
  fullName: string;
  color: string;
  factors: Factor[];
}

export const DOMAINS: Domain[] = [
  { id: 'health', name: 'Health', fullName: 'Health & Emotional Experience', color: '#52B788',
    factors: [
      { id: 1, name: 'Physical Health & Energy', q: 'Rate your physical energy, fitness, sleep quality, and overall bodily health.' },
      { id: 2, name: 'Mental & Emotional Health', q: 'Rate your ability to manage stress, stay emotionally stable, and maintain mental clarity.' },
      { id: 3, name: 'Positive Emotion & Gratitude', q: 'Rate how often you genuinely feel joy, gratitude, hope, and contentment.' },
      { id: 4, name: 'Psychological Flexibility', q: 'Rate how well you adapt to difficulty and act on your values even when uncomfortable.' },
    ]
  },
  { id: 'meaning', name: 'Meaning', fullName: 'Meaning, Identity & Character', color: '#C9A84C',
    factors: [
      { id: 5, name: 'Meaning & Purpose', q: 'Rate how clear, strong, and motivating your sense of life direction and purpose is.' },
      { id: 6, name: 'Identity & Self-Concept', q: 'Rate how grounded, positive, and accurate your sense of who you are is.' },
      { id: 7, name: 'Virtue & Character', q: 'Rate how consistently you act with integrity, honesty, and moral courage.' },
      { id: 8, name: 'Spirituality & Transcendence', q: 'Rate how deeply connected you feel to something larger than yourself.' },
    ]
  },
  { id: 'relationships', name: 'Relations', fullName: 'Relationships & Belonging', color: '#9B8EC4',
    factors: [
      { id: 9, name: 'Deep Relationships', q: 'Rate the depth, trust, and fulfillment in your closest personal relationships.' },
      { id: 10, name: 'Community & Contribution', q: 'Rate how connected and meaningfully contributing you are to a community beyond yourself.' },
    ]
  },
  { id: 'mastery', name: 'Mastery', fullName: 'Autonomy, Mastery & Engagement', color: '#2E86AB',
    factors: [
      { id: 11, name: 'Autonomy', q: 'Rate how much genuine freedom and self-direction you have over your life path.' },
      { id: 12, name: 'Competence', q: 'Rate how capable and effective you feel in your most important roles and skills.' },
      { id: 13, name: 'Achievement & Progress', q: 'Rate how consistently you make real, measurable progress toward meaningful goals.' },
      { id: 14, name: 'Engagement & Flow', q: 'Rate how often you are deeply absorbed in meaningful, challenging, rewarding work.' },
    ]
  },
  { id: 'resources', name: 'Resources', fullName: 'Resources, Work & Growth', color: '#E07A5F',
    factors: [
      { id: 15, name: 'Financial Stability', q: 'Rate how secure, sufficient, and stress-free your financial situation is.' },
      { id: 16, name: 'Economic Mobility', q: 'Rate how actively and realistically you are improving your financial trajectory.' },
      { id: 17, name: 'Education & Skills', q: 'Rate how deliberately and consistently you are growing your knowledge and capabilities.' },
    ]
  },
  { id: 'environment', name: 'Freedom', fullName: 'Environment, Freedom & Time', color: '#A8DADC',
    factors: [
      { id: 18, name: 'Environment & Safety', q: 'Rate how supportive, safe, and energizing your physical environment is.' },
      { id: 19, name: 'Freedom & Agency', q: 'Rate how free you are to live authentically and make choices aligned with your values.' },
      { id: 20, name: 'Time Use & Balance', q: 'Rate how well your daily time use actually reflects your real values and priorities.' },
    ]
  },
];

export interface FullFactor extends Factor {
  domainId: string;
  domainName: string;
  shortDomain: string;
  color: string;
}

export const ALL_FACTORS: FullFactor[] = DOMAINS.flatMap(d =>
  d.factors.map(f => ({ ...f, domainId: d.id, domainName: d.fullName, shortDomain: d.name, color: d.color }))
);

export interface Profile {
  name: string;
  mission: string;
}

export interface CheckIn {
  date: string;
  mood: number;
  note: string;
}

export type Scores = Record<number, number>;
