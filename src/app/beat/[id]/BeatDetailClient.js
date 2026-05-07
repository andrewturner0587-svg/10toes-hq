"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TIERS } from "@/lib/constants";

function getYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function BeatDetailClient({ beat, initialComments, initialLiked, userId, currentUsername }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(beat.like_count || 0);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const tier = TIERS[beat.tier];
  const ytId = getYtId(beat.yt_url);

  const handleLike = async () => {
    const supabase = createClient();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => c + (newLiked ? 1 : -1));
    if (newLiked) {
      await supabase.from("likes").insert({ user_id: userId, beat_id: beat.id });
    } else {
      await supabase.from("likes").delete().eq("user_id", userId).eq("beat_id", beat.id);
    }
    await supabase.from("beats").update({ like_count: likeCount + (newLiked ? 1 : -1) }).eq("id", beat.id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    const supabase = createClient();
    const { data: comment } = await supabase
      .from("comments")
      .insert({ user_id: userId, beat_id: beat.id, body: commentText.trim() })
      .select("*, profiles(username)")
      .single();
    if (comment) {
      setComments(prev => [...prev, comment]);
      setCommentText("");
      await supabase.from("beats").update({ comment_count: comments.length + 1 }).eq("id", beat.id);
    }
    setPosting(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div>
      <Link href="/feed" style={{ fontSize: 12, color: "var(--dim)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        ← Back to Feed
      </Link>

      {/* Beat Header */}
      <div className="card" style={{ borderLeft: `4px solid ${tier?.color || "var(--border)"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{beat.name}</h1>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {beat.genre && <span className="tag tag-genre">{beat.genre}</span>}
              {beat.mood && <span className="tag tag-mood">{beat.mood}</span>}
              {beat.style && <span className="tag" style={{ background: "rgba(255,255,255,0.04)", color: "var(--dim)" }}>{beat.style}</span>}
              {beat.era && <span className="tag" style={{ background: "rgba(255,255,255,0.04)", color: "var(--dim)" }}>{beat.era}</span>}
              {beat.instrument && <span className="tag" style={{ background: "rgba(255,255,255,0.04)", color: "var(--dim)" }}>🎹 {beat.instrument}</span>}
              {beat.bpm && <span className="tag" style={{ background: "rgba(255,255,255,0.04)", color: "var(--dim)", fontFamily: "'DM Mono',monospace" }}>{beat.bpm} BPM</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {beat.on_yt && <span className="badge badge-yt-on">YouTube</span>}
            {beat.on_bs && <span className="badge badge-bs-on">BeatStars</span>}
          </div>
        </div>

        {/* YT Embed */}
        {ytId && (
          <div className="yt-embed" style={{ marginBottom: 16 }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title={beat.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {beat.yt_title && (
          <div style={{ padding: "8px 12px", background: "var(--bg2)", borderRadius: 8, marginBottom: 12, fontSize: 12, color: "var(--accent)", fontFamily: "'DM Mono',monospace" }}>
            📋 YT Title: {beat.yt_title}
            <button onClick={() => navigator.clipboard.writeText(beat.yt_title)} style={{ marginLeft: 8, fontSize: 10, color: "var(--dim)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Copy</button>
          </div>
        )}

        {beat.license && (
          <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 8 }}>
            License: <span style={{ color: "var(--green)", fontWeight: 700 }}>{beat.license}</span>
          </div>
        )}

        {beat.notes && (
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, padding: "10px 14px", background: "var(--bg2)", borderRadius: 8 }}>
            {beat.notes}
          </div>
        )}

        {/* Producer + Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <Link href={`/producer/${beat.profiles?.username}`} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>
              {beat.profiles?.username?.[0]?.toUpperCase()}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>@{beat.profiles?.username}</div>
              <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace" }}>
                {new Date(beat.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`like-btn${liked ? " liked" : ""}`} onClick={handleLike}>
              <span className="heart">{liked ? "❤️" : "🤍"}</span> {likeCount}
            </button>
            <button onClick={copyLink} className="btn btn-secondary btn-sm">🔗 Share</button>
          </div>
        </div>
      </div>

      {/* Suno Prompt */}
      {beat.suno_prompt && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2 }}>SUNO PROMPT</h3>
            <button onClick={() => navigator.clipboard.writeText(beat.suno_prompt)} className="btn btn-secondary btn-sm">Copy</button>
          </div>
          <pre style={{ fontSize: 12, color: "var(--text2)", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'DM Mono',monospace", lineHeight: 1.6 }}>{beat.suno_prompt}</pre>
        </div>
      )}

      {/* Comments */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>
          COMMENTS ({comments.length})
        </h3>

        {comments.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--dim)", fontSize: 13 }}>
            Be the first to comment. 🎤
          </div>
        )}

        {comments.map(c => (
          <div key={c.id} className="comment">
            <div className="comment-avatar">{c.profiles?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div className="comment-meta">
                <Link href={`/producer/${c.profiles?.username}`} style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>
                  @{c.profiles?.username}
                </Link>
                {" · "}{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="comment-body">{c.body}</div>
            </div>
          </div>
        ))}

        <form onSubmit={handleComment} style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <div className="comment-avatar" style={{ flexShrink: 0 }}>{currentUsername?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, display: "flex", gap: 8 }}>
            <input
              type="text"
              className="field-input"
              style={{ flex: 1 }}
              placeholder="Drop a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              maxLength={500}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={posting || !commentText.trim()}>
              {posting ? "…" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
