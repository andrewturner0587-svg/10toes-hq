import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import PromptsClient from "./PromptsClient";

export const metadata = { title: "Suno Prompts — 10TOES HQ" };

export default async function PromptsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  const { data: prompts } = await supabase
    .from("suno_prompts")
    .select("*, profiles(username)")
    .eq("is_public", true)
    .order("times_used", { ascending: false });

  return (
    <div className="page-in">
      <AppHeader username={profile?.username} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        <PromptsClient initialPrompts={prompts || []} userId={user.id} />
      </div>
    </div>
  );
}
