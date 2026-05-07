"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TIERS, GENRES, MOODS } from "@/lib/constants";

function getYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function BeatCard({ beat, liked, onLike, currentUsername }) {
  const tier = TIERS[beat.tier];
  const ytId = getYtId(beat.yt_url);

  return (
    <div className="beat-card" style={{ borderLeft: `3px solid ${tier?.color || "var(--border)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <Link href={`/beat/${beat.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, lineHeight: 1.3 }}>{beat.name}</h3>
          </Link>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {beat.genre && <span className="tag tag-genre">{beat.genre}</span>}
            {beat.mood && <span className="tag tag-mood">{beat.mood}</span>}
            {beat.style && <span className="tag" style={{ background: "rgba(255,255,255,0.04)", color: "var(--dim)" }}>{beat.style}</span>}
            {beat.bpm && <span className="tag" style={{ background: "rgba(255,255,255,0.04)", color: "var(--dim)", fontFamily: "'DM Mono', monospace" }}>{beat.bpm} BPM</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {beat.on_yt && <span className="badge badge-yt-on">YT</span>}
          {beat.on_bs && <span className="badge badge-bs-on">BS</span>}
        </div>
      </div>

      {ytId && (
        <div className="yt-embed" style={{ marginBottom: 12 }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={beat.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {beat.yt_title && !ytId && (
        <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "'DM Mono', monospace", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          YT: {beat.yt_title}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href={`/producer/${beat.profiles?.username}`} style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "var(--text2)", fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
              {beat.profiles?.username?.[0]?.toUpperCase()}
            </span>
            @{beat.profiles?.username}
          </Link>
          <span style={{ color: "var(--dim)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
            {new Date(beat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className={`like-btn${liked ? " liked" : ""}`} onClick={() => onLike(beat.id)}>
            <span className="heart">{liked ? "❤️" : "🤍"}</span>
            {beat.like_count || 0}
          </button>
          <Link href={`/beat/${beat.id}`} style={{ fontSize: 11, color: "var(--dim)", textDecoration: "none" }}>
            💬 {beat.comment_count || 0}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeedClient({ initialBeats, likedSet, userId, currentUsername }) {
  const [beats, setBeats] = useState(initialBeats);
  const [liked, setLiked] = useState(new Set(likedSet));
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("feed_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "beats", filter: "is_public=eq.true" }, () => {
        setNewCount(c => c + 1);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const refreshFeed = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("beats")
      .select("*, profiles(username, avatar_url)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);
    setBeats(data || []);
    setNewCount(0);
  };

  const handleLike = async (beatId) => {
    const supabase = createClient();
    const isLiked = liked.has(beatId);

    setLiked(prev => { const n = new Set(prev); isLiked ? n.delete(beatId) : n.add(beatId); return n; });
    setBeats(prev => prev.map(b => b.id === beatId ? { ...b, like_count: (b.like_count || 0) + (isLiked ? -1 : 1) } : b));

    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", userId).eq("beat_id", beatId);
    } else {
      await supabase.from("likes").insert({ user_id: userId, beat_id: beatId });
    }
    await supabase.from("beats").update({ like_count: beats.find(b=>b.id===beatId)?.like_count+(isLiked?-1:1) }).eq("id", beatId);
  };

  const filtered = beats.filter(b => {
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.genre?.toLowerCase().includes(search.toLowerCase()) || b.mood?.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter === "all" || b.genre === genreFilter;
    const matchTier = tierFilter === "all" || b.tier === tierFilter;
    return matchSearch && matchGenre && matchTier;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Community Feed</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div className="realtime-dot" />
            <span style={{ fontSize: 11, color: "var(--dim)", fontFamily: "'DM Mono', monospace" }}>LIVE</span>
          </div>
        </div>
        {newCount > 0 && (
          <button onClick={refreshFeed} className="btn btn-primary btn-sm">
            ↑ {newCount} new beat{newCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="field-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search beats, genre, mood…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="field-input" style={{ width: "auto" }} value={genreFilter} onChange={e => setGenreFilter(e.target.value)}>
          <option value="all">All Genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="field-input" style={{ width: "auto" }} value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
          <option value="all">All Tiers</option>
          {Object.entries(TIERS).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
        </select>
      </div>

      <div className="filter-bar">
        {["all","1","2","3","4"].map(f => (
          <button key={f} onClick={() => setTierFilter(f)} className="pill" style={{ border: `1px solid ${tierFilter===f ? (f==="all" ? "rgba(139,92,246,0.4)" : TIERS[f]?.color+"44") : "var(--border)"}`, background: tierFilter===f ? (f==="all" ? "rgba(139,92,246,0.1)" : TIERS[f]?.bg) : "transparent", color: tierFilter===f ? (f==="all" ? "var(--accent)" : TIERS[f]?.color) : "var(--dim)" }}>
            {f === "all" ? `All (${beats.length})` : `${TIERS[f]?.label} (${beats.filter(b=>b.tier===f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎹</div>
          <div className="empty-title">No beats found</div>
          <div className="empty-text">Try adjusting your filters or search term.</div>
        </div>
      ) : (
        <div className="grid-feed">
          {filtered.map(b => (
            <BeatCard key={b.id} beat={b} liked={liked.has(b.id)} onLike={handleLike} currentUsername={currentUsername} />
          ))}
        </div>
      )}
    </div>
  );
}
