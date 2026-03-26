import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getOverall, getDomainScoresMap } from '@/components/hos/helpers';
import type { Profile, Scores, CheckIn, Assessment } from '@/components/hos/constants';

interface HosData {
  profile: Profile | null;
  scores: Scores;
  checkIns: CheckIn[];
  assessments: Assessment[];
  goals: { id: string; title: string; category: string; active: boolean }[];
  streak: { current: number; longest: number };
  coachingMessages: { id: string; message: string; created_at: string; checkin_id: string | null }[];
  loading: boolean;
  onboardingCompleted: boolean;
  assessmentCompleted: boolean;
  saveProfile: (p: Profile) => Promise<void>;
  saveScores: (s: Scores) => Promise<void>;
  saveCheckIn: (ci: Omit<CheckIn, 'date'>) => Promise<string | null>;
  updateProfile: (p: Profile) => Promise<void>;
  saveGoal: (title: string, category: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useHosData(): HosData {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Scores>({});
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [goals, setGoals] = useState<{ id: string; title: string; category: string; active: boolean }[]>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [coachingMessages, setCoachingMessages] = useState<{ id: string; message: string; created_at: string; checkin_id: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      // Fetch all in parallel
      const [profileRes, scoresRes, checkInsRes, assessmentsRes, goalsRes, streakRes, coachRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('scores').select('*').eq('user_id', user.id),
        supabase.from('daily_checkins').select('*').eq('user_id', user.id).order('date', { ascending: true }),
        supabase.from('assessments').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('coaching_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);

      if (profileRes.data) {
        setProfile({ name: profileRes.data.name, mission: profileRes.data.mission });
        setOnboardingCompleted(profileRes.data.onboarding_completed);
      }

      if (scoresRes.data) {
        const s: Scores = {};
        scoresRes.data.forEach(row => { s[row.factor_id] = Number(row.score); });
        setScores(s);
        setAssessmentCompleted(scoresRes.data.length >= 20);
      }

      if (checkInsRes.data) {
        setCheckIns(checkInsRes.data.map(ci => ({
          date: ci.date,
          mood: Number(ci.mood),
          energy: Number(ci.energy),
          win: ci.win ?? undefined,
          miss: ci.miss ?? undefined,
          note: ci.reflection ?? '',
          tasksCompleted: Array.isArray(ci.completed_tasks) ? ci.completed_tasks as boolean[] : undefined,
        })));
      }

      if (assessmentsRes.data) {
        setAssessments(assessmentsRes.data.map(a => ({
          date: a.created_at,
          scores: a.scores as unknown as Scores,
          domainScores: a.domain_scores as unknown as Record<string, number>,
          overall: Number(a.overall),
        })));
      }

      if (goalsRes.data) {
        setGoals(goalsRes.data.map(g => ({ id: g.id, title: g.title, category: g.category, active: g.active })));
      }

      if (streakRes.data) {
        setStreak({ current: streakRes.data.current_streak, longest: streakRes.data.longest_streak });
      }

      if (coachRes.data) {
        setCoachingMessages(coachRes.data.map(m => ({
          id: m.id, message: m.message, created_at: m.created_at, checkin_id: m.checkin_id,
        })));
      }
    } catch (err) {
      console.error('Error fetching HOS data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveProfile = async (p: Profile) => {
    if (!user) return;
    await supabase.from('profiles').update({
      name: p.name,
      mission: p.mission,
      onboarding_completed: true,
    }).eq('user_id', user.id);
    setProfile(p);
    setOnboardingCompleted(true);
  };

  const saveScores = async (s: Scores) => {
    if (!user) return;
    // Upsert all scores
    const rows = Object.entries(s).map(([factorId, score]) => ({
      user_id: user.id,
      factor_id: Number(factorId),
      score: Number(score),
    }));
    await supabase.from('scores').upsert(rows, { onConflict: 'user_id,factor_id' });

    // Save assessment snapshot
    const domainScores = getDomainScoresMap(s);
    const overall = getOverall(s);
    await supabase.from('assessments').insert([{
      user_id: user.id,
      scores: s as unknown as Record<string, unknown>,
      domain_scores: domainScores as unknown as Record<string, unknown>,
      overall,
    }]);

    setScores(s);
    setAssessmentCompleted(true);
    await fetchData();
  };

  const saveCheckIn = async (ci: Omit<CheckIn, 'date'>): Promise<string | null> => {
    if (!user) return null;
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase.from('daily_checkins').upsert({
      user_id: user.id,
      date: today,
      mood: ci.mood,
      energy: ci.energy,
      win: ci.win,
      miss: ci.miss,
      reflection: ci.note,
      planned_tasks: [],
      completed_tasks: ci.tasksCompleted ?? [],
    }, { onConflict: 'user_id,date' }).select('id').single();

    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: streakData } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();
    if (streakData) {
      let newStreak = 1;
      if (streakData.last_checkin_date === yesterdayStr) {
        newStreak = streakData.current_streak + 1;
      } else if (streakData.last_checkin_date === today) {
        newStreak = streakData.current_streak;
      }
      const longest = Math.max(newStreak, streakData.longest_streak);
      await supabase.from('streaks').update({
        current_streak: newStreak,
        longest_streak: longest,
        last_checkin_date: today,
      }).eq('user_id', user.id);
      setStreak({ current: newStreak, longest });
    }

    await fetchData();
    return data?.id ?? null;
  };

  const updateProfile = async (p: Profile) => {
    if (!user) return;
    await supabase.from('profiles').update({ name: p.name, mission: p.mission }).eq('user_id', user.id);
    setProfile(p);
  };

  const saveGoal = async (title: string, category: string) => {
    if (!user) return;
    await supabase.from('goals').insert({ user_id: user.id, title, category });
    await fetchData();
  };

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    await fetchData();
  };

  return {
    profile, scores, checkIns, assessments, goals, streak, coachingMessages,
    loading, onboardingCompleted, assessmentCompleted,
    saveProfile, saveScores, saveCheckIn, updateProfile, saveGoal, deleteGoal,
    refreshData: fetchData,
  };
}
