import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "Dashboard — 10TOES HQ" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { data: beats } = await supabase
    .from("beats")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: prompts } = await supabase
    .from("suno_prompts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Leaderboard
  const { data: leaderboard } = await supabase
    .from("profiles")
    .select("username, id")
    .eq("subscription_status", "active")
    .limit(20);

  // Get beat counts for leaderboard
  const { data: beatCounts } = await supabase
    .from("beats")
    .select("user_id")
    .eq("is_public", true);

  const countMap = (beatCounts||[]).reduce((acc, b) => { acc[b.user_id] = (acc[b.user_id]||0)+1; return acc; }, {});
  const ranked = (leaderboard||[])
    .map(p => ({ ...p, count: countMap[p.id] || 0 }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="page-in">
      <AppHeader username={profile?.username} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        <DashboardClient
          profile={profile}
          initialBeats={beats || []}
          initialPrompts={prompts || []}
          leaderboard={ranked}
          userId={user.id}
        />
      </div>
    </div>
  );
}
