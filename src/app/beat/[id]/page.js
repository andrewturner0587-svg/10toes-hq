import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import BeatDetailClient from "./BeatDetailClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  return { title: `Beat — 10TOES HQ` };
}

export default async function BeatDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  const { data: beat } = await supabase
    .from("beats")
    .select("*, profiles(username, avatar_url)")
    .eq("id", id)
    .single();

  if (!beat) return notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(username)")
    .eq("beat_id", id)
    .order("created_at", { ascending: true });

  const { data: like } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("beat_id", id)
    .single();

  return (
    <div className="page-in">
      <AppHeader username={profile?.username} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60, maxWidth: 680 }}>
        <BeatDetailClient
          beat={beat}
          initialComments={comments || []}
          initialLiked={!!like}
          userId={user.id}
          currentUsername={profile?.username}
        />
      </div>
    </div>
  );
}
