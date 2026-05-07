import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import NichesClient from "./NichesClient";

export const metadata = { title: "Niche Map — 10TOES HQ" };

export default async function NichesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  // Count how many community beats per niche title
  const { data: beats } = await supabase.from("beats").select("name,genre,mood,style").eq("is_public", true);

  return (
    <div className="page-in">
      <AppHeader username={profile?.username} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        <NichesClient beats={beats || []} />
      </div>
    </div>
  );
}
