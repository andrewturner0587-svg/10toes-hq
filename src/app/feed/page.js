import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import FeedClient from "./FeedClient";

export const metadata = { title: "Feed — 10TOES HQ" };

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  const { data: beats } = await supabase
    .from("beats")
    .select("*, profiles(username, avatar_url)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: myLikes } = await supabase
    .from("likes")
    .select("beat_id")
    .eq("user_id", user.id);

  const likedSet = new Set((myLikes || []).map(l => l.beat_id));

  return (
    <div className="page-in">
      <AppHeader username={profile?.username} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        <FeedClient initialBeats={beats || []} likedSet={[...likedSet]} userId={user.id} currentUsername={profile?.username} />
      </div>
    </div>
  );
}
