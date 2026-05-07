import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import SettingsClient from "./SettingsClient";

export const metadata = { title: "Settings — 10TOES HQ" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="page-in">
      <AppHeader username={profile?.username} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60, maxWidth: 520 }}>
        <SettingsClient profile={profile} email={user.email} />
      </div>
    </div>
  );
}
