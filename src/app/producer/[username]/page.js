import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TIERS } from "@/lib/constants";

export async function generateMetadata({ params }) {
  const { username } = await params;
  return { title: `@${username} — 10TOES HQ` };
}

export default async function ProducerProfilePage({ params }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  const { data: producer } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!producer) return notFound();

  const { data: beats } = await supabase
    .from("beats")
    .select("*")
    .eq("user_id", producer.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const totalLikes = (beats || []).reduce((a, b) => a + (b.like_count || 0), 0);
  const topTier = Object.entries(
    (beats || []).reduce((acc, b) => { acc[b.tier] = (acc[b.tier]||0)+1; return acc; }, {})
  ).sort((a,b)=>b[1]-a[1])[0]?.[0];

  return (
    <div className="page-in">
      <AppHeader username={currentProfile?.username} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60, maxWidth: 700 }}>
        {/* Profile Header */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div className="producer-avatar producer-avatar-lg">
              {producer.username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>@{producer.username}</h1>
              {producer.bio && <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>{producer.bio}</p>}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{(beats||[]).length}</div>
                  <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>BEATS</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--red)" }}>{totalLikes}</div>
                  <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>LIKES</div>
                </div>
                {topTier && (
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: TIERS[topTier]?.color }}>{TIERS[topTier]?.label}</div>
                    <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>TOP TIER</div>
                  </div>
                )}
              </div>
            </div>
            {currentProfile?.username === producer.username && (
              <Link href="/dashboard/settings" className="btn btn-secondary btn-sm">Edit Profile</Link>
            )}
          </div>
        </div>

        {/* Beat Grid */}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 14 }}>
          BEATS ({(beats||[]).length})
        </h2>

        {(beats||[]).length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎹</div>
            <div className="empty-title">No public beats yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {beats.map(b => {
              const tier = TIERS[b.tier];
              return (
                <Link key={b.id} href={`/beat/${b.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="beat-card" style={{ borderLeft: `3px solid ${tier?.color || "var(--border)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{b.name}</div>
                        <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace" }}>
                          {[b.mood, b.genre, b.style, b.bpm && b.bpm+" BPM"].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "var(--dim)" }}>❤️ {b.like_count||0}</span>
                        {b.on_yt && <span className="badge badge-yt-on">YT</span>}
                        {b.on_bs && <span className="badge badge-bs-on">BS</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
