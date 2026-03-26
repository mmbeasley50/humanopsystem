import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { checkin_id } = await req.json();

    // Fetch user data
    const [profileRes, scoresRes, checkInsRes, goalsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("scores").select("*").eq("user_id", userId),
      supabase.from("daily_checkins").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(7),
      supabase.from("goals").select("*").eq("user_id", userId).eq("active", true),
    ]);

    const profile = profileRes.data;
    const scores = scoresRes.data || [];
    const recentCheckins = checkInsRes.data || [];
    const goals = goalsRes.data || [];
    const latestCheckin = recentCheckins[0];

    const scoresStr = scores.map((s: any) => `Factor ${s.factor_id}: ${s.score}/10`).join(", ");
    const goalsStr = goals.map((g: any) => `${g.title} (${g.category})`).join(", ") || "No goals set";
    const recentStr = recentCheckins.map((ci: any) =>
      `${ci.date}: mood=${ci.mood}, energy=${ci.energy}${ci.win ? `, win="${ci.win}"` : ""}${ci.miss ? `, miss="${ci.miss}"` : ""}${ci.reflection ? `, reflection="${ci.reflection}"` : ""}`
    ).join("\n") || "No recent check-ins";
    const latestStr = latestCheckin
      ? `Date: ${latestCheckin.date}, Mood: ${latestCheckin.mood}, Energy: ${latestCheckin.energy}, Win: ${latestCheckin.win || "none"}, Miss: ${latestCheckin.miss || "none"}, Reflection: ${latestCheckin.reflection || "none"}`
      : "No check-in today";

    const systemPrompt = `You are an elite life and performance coach.

Your job is to analyze the user's behavior and push them toward growth, discipline, and alignment.

User context:
- Name: ${profile?.name || "Unknown"}
- Mission: ${profile?.mission || "Not set"}
- Goals: ${goalsStr}
- Scores: ${scoresStr}
- Recent behavior (last 7 days):
${recentStr}
- Latest check-in: ${latestStr}

You must:
1. Identify follow-through vs failure
2. Detect patterns
3. Call out avoidance or inconsistency directly
4. Reinforce wins
5. Give 1-3 actionable next steps

Tone: direct, honest, not soft, growth-focused.
Avoid generic advice. Keep it under 200 words. Be specific to their data.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Analyze my latest check-in and give me coaching." },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit reached. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices?.[0]?.message?.content || "Unable to generate coaching at this time.";

    // Store coaching message
    await supabase.from("coaching_messages").insert({
      user_id: userId,
      checkin_id: checkin_id || null,
      message,
    });

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("coaching error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
