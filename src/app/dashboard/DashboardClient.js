"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TIERS, GENRES, STYLES, MOODS, ERAS, INSTRUMENTS, LICENSE_TYPES } from "@/lib/constants";

const defaultBeat = () => ({
  name: "", genre: "", style: "Freestyle Beat", tier: "3", mood: "", era: "",
  instrument: "", bpm: "", license: "Free For Profit", yt_title: "", yt_url: "",
  suno_prompt: "", notes: "", on_yt: false, on_bs: false, is_public: true,
});

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{icon} {label}</div>
    </div>
  );
}

export default function DashboardClient({ profile, initialBeats, initialPrompts, leaderboard, userId }) {
  const [beats, setBeats] = useState(initialBeats);
  const [prompts, setPrompts] = useState(initialPrompts);
  const [view, setView] = useState("overview");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(defaultBeat());
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const total = beats.length;
  const onYT = beats.filter(b => b.on_yt).length;
  const onBS = beats.filter(b => b.on_bs).length;
  const pipe = total - Math.max(onYT, onBS);
  const week = beats.filter(b => (new Date() - new Date(b.created_at)) / 864e5 <= 7).length;
  const filtered = filter === "all" ? beats : beats.filter(b => b.tier === filter);

  const openAdd = () => { setForm({ ...defaultBeat() }); setModal("add"); };
  const openEdit = (b) => { setForm({ ...b }); setModal("edit"); };

  const saveBeat = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const gen = form.genre && form.mood && form.style
      ? `${form.mood} ${form.genre} ${form.style}${form.era ? " " + form.era : ""} | Free For Profit`
      : "";
    const payload = { ...form, yt_title: form.yt_title || gen, user_id: userId };

    if (modal === "add") {
      const { data } = await supabase.from("beats").insert(payload).select().single();
      if (data) { setBeats(prev => [data, ...prev]); showToast("Beat added! 🎹"); }
    } else {
      const { data } = await supabase.from("beats").update(payload).eq("id", form.id).select().single();
      if (data) { setBeats(prev => prev.map(b => b.id === data.id ? data : b)); showToast("Beat updated ✅"); }
    }
    setModal(null);
    setLoading(false);
  };

  const deleteBeat = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("beats").delete().eq("id", form.id);
    setBeats(prev => prev.filter(b => b.id !== form.id));
    setModal(null);
    setLoading(false);
    showToast("Beat deleted");
  };

  const toggleField = async (id, field) => {
    const supabase = createClient();
    const beat = beats.find(b => b.id === id);
    const newVal = !beat[field];
    setBeats(prev => prev.map(b => b.id === id ? { ...b, [field]: newVal } : b));
    await supabase.from("beats").update({ [field]: newVal }).eq("id", id);
  };

  const f = form;
  const sf = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const NAV_TABS = [
    { k: "overview", l: "Overview" },
    { k: "catalog", l: `Catalog (${total})` },
    { k: "prompts", l: `Prompts (${prompts.length})` },
    { k: "leaderboard", l: "Leaderboard" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>My HQ</h1>
          <div style={{ fontSize: 12, color: "var(--dim)", fontFamily: "'DM Mono',monospace" }}>@{profile?.username}</div>
        </div>
        <button onClick={openAdd} className="btn btn-primary">+ Add Beat</button>
      </div>

      {/* Tab Nav */}
      <div style={{ display: "flex", gap: 3, marginBottom: 24, overflowX: "auto" }}>
        {NAV_TABS.map(t => (
          <button key={t.k} onClick={() => setView(t.k)} className={`nav-btn${view===t.k?" active":""}`}>{t.l}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {view === "overview" && (
        <>
          <div className="grid-stats" style={{ marginBottom: 20 }}>
            <StatCard label="TOTAL" value={total} color="var(--accent)" icon="🎹" />
            <StatCard label="YOUTUBE" value={onYT} color="var(--red)" icon="▶" />
            <StatCard label="BEATSTARS" value={onBS} color="var(--yellow)" icon="🛒" />
            <StatCard label="PIPELINE" value={pipe} color="var(--dim)" icon="⏳" />
            <StatCard label="THIS WEEK" value={week} color="var(--green)" icon="📅" />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>
              BEATS BY TIER
            </h3>
            {Object.entries(TIERS).map(([k, t]) => {
              const c = beats.filter(b => b.tier === k).length;
              const pct = total > 0 ? (c / total) * 100 : 0;
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 60, fontSize: 10, color: t.color, fontWeight: 700, fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>{t.label}</div>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${t.color}55, ${t.color})`, minWidth: c > 0 ? 14 : 0 }} />
                  </div>
                  <div style={{ width: 20, textAlign: "right", fontSize: 13, fontWeight: 800, color: t.color }}>{c}</div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 14 }}>RECENT BEATS</h3>
            {beats.slice(0, 8).map(b => (
              <div key={b.id} onClick={() => openEdit(b)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", background: "var(--bg2)", borderRadius: 8, cursor: "pointer", marginBottom: 6 }}>
                <div style={{ width: 4, height: 30, borderRadius: 2, background: TIERS[b.tier]?.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace" }}>{[b.mood,b.genre,b.style].filter(Boolean).join(" · ")}</div>
                </div>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  <span onClick={e=>{e.stopPropagation();toggleField(b.id,"on_yt");}} className={`badge ${b.on_yt?"badge-yt-on":"badge-yt-off"}`}>YT</span>
                  <span onClick={e=>{e.stopPropagation();toggleField(b.id,"on_bs");}} className={`badge ${b.on_bs?"badge-bs-on":"badge-bs-off"}`}>BS</span>
                </div>
              </div>
            ))}
            {total === 0 && <div style={{ textAlign: "center", padding: 32, color: "var(--dim)", fontSize: 13 }}>No beats yet. Hit &quot;+ Add Beat&quot; to start your catalog.</div>}
          </div>
        </>
      )}

      {/* CATALOG */}
      {view === "catalog" && (
        <>
          <div className="filter-bar">
            <button onClick={() => setFilter("all")} className="pill" style={{ border: `1px solid ${filter==="all"?"rgba(139,92,246,0.4)":"var(--border)"}`, background: filter==="all"?"rgba(139,92,246,0.1)":"transparent", color: filter==="all"?"var(--accent)":"var(--dim)" }}>All ({total})</button>
            {Object.entries(TIERS).map(([k,t]) => (
              <button key={k} onClick={() => setFilter(k)} className="pill" style={{ border: `1px solid ${filter===k?t.color+"44":"var(--border)"}`, background: filter===k?t.bg:"transparent", color: filter===k?t.color:"var(--dim)" }}>
                {t.label} ({beats.filter(b=>b.tier===k).length})
              </button>
            ))}
          </div>
          {filtered.length === 0
            ? <div className="empty"><div className="empty-icon">🎹</div><div className="empty-title">No beats here yet</div></div>
            : filtered.map(b => (
              <div key={b.id} onClick={() => openEdit(b)} className="beat-card" style={{ borderLeft: `3px solid ${TIERS[b.tier]?.color}`, marginBottom: 8, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{b.name}</div>
                    <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace", marginTop: 3 }}>
                      {[b.mood,b.genre,b.style,b.era,b.bpm&&b.bpm+" BPM"].filter(Boolean).join(" · ")}
                    </div>
                    {b.yt_title && <div style={{ marginTop: 5, fontSize: 10, color: "var(--accent)", fontFamily: "'DM Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>YT: {b.yt_title}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <span onClick={e=>{e.stopPropagation();toggleField(b.id,"on_yt");}} className={`badge ${b.on_yt?"badge-yt-on":"badge-yt-off"}`}>YT</span>
                    <span onClick={e=>{e.stopPropagation();toggleField(b.id,"on_bs");}} className={`badge ${b.on_bs?"badge-bs-on":"badge-bs-off"}`}>BS</span>
                  </div>
                </div>
              </div>
            ))
          }
        </>
      )}

      {/* PROMPTS */}
      {view === "prompts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {prompts.length === 0
            ? <div className="empty"><div className="empty-icon">🤖</div><div className="empty-title">No prompts yet</div><div className="empty-text">Add prompts from the community Prompt Bank page.</div></div>
            : prompts.map(p => (
              <div key={p.id} className="card card-sm">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {p.genre && <span className="tag tag-genre">{p.genre}</span>}
                  {p.mood && <span className="tag tag-mood">{p.mood}</span>}
                  {p.style && <span className="tag" style={{ background: "rgba(245,158,11,0.1)", color: "var(--yellow)" }}>{p.style}</span>}
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace" }}>Used: {p.times_used}x</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{p.prompt}</p>
                <button onClick={() => { navigator.clipboard.writeText(p.prompt); showToast("Copied! 🎹"); }} className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>📋 Copy</button>
              </div>
            ))
          }
        </div>
      )}

      {/* LEADERBOARD */}
      {view === "leaderboard" && (
        <div>
          <div className="card">
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>
              🏆 TOP PRODUCERS BY BEATS
            </h3>
            {leaderboard.map((p, i) => (
              <Link key={p.id} href={`/producer/${p.username}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div className="lb-row">
                  <div className={`lb-rank${i===0?" gold":i===1?" silver":i===2?" bronze":""}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                  </div>
                  <div className="producer-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                    {p.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>@{p.username}</div>
                    {p.username === profile?.username && <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "'DM Mono',monospace" }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)" }}>{p.count} beats</div>
                </div>
              </Link>
            ))}
            {leaderboard.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "var(--dim)", fontSize: 13 }}>No data yet — add public beats to climb the board!</div>}
          </div>
        </div>
      )}

      {/* ADD / EDIT BEAT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === "add" ? "Add Beat" : "Edit Beat"}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="field-label">BEAT NAME *</label>
                <input type="text" className="field-input" value={f.name} onChange={e=>sf("name",e.target.value)} placeholder="e.g. Midnight Cipher" />
              </div>
              <div className="grid-2">
                <div>
                  <label className="field-label">GENRE</label>
                  <select className="field-input" value={f.genre} onChange={e=>sf("genre",e.target.value)}>
                    <option value="">Select…</option>
                    {GENRES.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">STYLE</label>
                  <select className="field-input" value={f.style} onChange={e=>sf("style",e.target.value)}>
                    {STYLES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div>
                  <label className="field-label">MOOD</label>
                  <select className="field-input" value={f.mood} onChange={e=>sf("mood",e.target.value)}>
                    <option value="">Select…</option>
                    {MOODS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">TIER</label>
                  <select className="field-input" value={f.tier} onChange={e=>sf("tier",e.target.value)}>
                    {Object.entries(TIERS).map(([k,t])=><option key={k} value={k}>{t.label} — {t.sub}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-3">
                <div>
                  <label className="field-label">ERA</label>
                  <select className="field-input" value={f.era} onChange={e=>sf("era",e.target.value)}>
                    <option value="">Select…</option>
                    {ERAS.map(e=><option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">INSTRUMENT</label>
                  <select className="field-input" value={f.instrument} onChange={e=>sf("instrument",e.target.value)}>
                    <option value="">Select…</option>
                    {INSTRUMENTS.map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">BPM</label>
                  <input type="number" className="field-input" value={f.bpm} onChange={e=>sf("bpm",e.target.value)} placeholder="140" />
                </div>
              </div>
              <div>
                <label className="field-label">LICENSE</label>
                <select className="field-input" value={f.license} onChange={e=>sf("license",e.target.value)}>
                  {LICENSE_TYPES.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">YOUTUBE URL (optional)</label>
                <input type="url" className="field-input" value={f.yt_url} onChange={e=>sf("yt_url",e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="field-label">YOUTUBE TITLE</label>
                <input type="text" className="field-input" value={f.yt_title} onChange={e=>sf("yt_title",e.target.value)} placeholder="Auto-generates from mood+genre+style" />
              </div>
              <div>
                <label className="field-label">SUNO PROMPT</label>
                <textarea className="field-input" value={f.suno_prompt} onChange={e=>sf("suno_prompt",e.target.value)} placeholder="Paste prompt…" rows={3} />
              </div>
              <div>
                <label className="field-label">NOTES</label>
                <input type="text" className="field-input" value={f.notes} onChange={e=>sf("notes",e.target.value)} placeholder="Notes…" />
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  <input type="checkbox" checked={f.on_yt} onChange={e=>sf("on_yt",e.target.checked)} />
                  <span style={{ color: f.on_yt?"var(--red)":"var(--dim)" }}>YouTube</span>
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  <input type="checkbox" checked={f.on_bs} onChange={e=>sf("on_bs",e.target.checked)} />
                  <span style={{ color: f.on_bs?"var(--yellow)":"var(--dim)" }}>BeatStars</span>
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  <input type="checkbox" checked={f.is_public} onChange={e=>sf("is_public",e.target.checked)} />
                  <span style={{ color: f.is_public?"var(--green)":"var(--dim)" }}>Public</span>
                </label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveBeat} className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? "Saving…" : modal === "add" ? "Add Beat" : "Save Changes"}
                </button>
                {modal === "edit" && (
                  <button onClick={deleteBeat} className="btn btn-danger" disabled={loading}>Delete</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
