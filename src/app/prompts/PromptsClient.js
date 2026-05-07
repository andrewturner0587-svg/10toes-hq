"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GENRES, STYLES, MOODS } from "@/lib/constants";
import Link from "next/link";

function PromptCard({ p, onCopy }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {p.genre && <span className="tag tag-genre">{p.genre}</span>}
          {p.mood && <span className="tag tag-mood">{p.mood}</span>}
          {p.style && <span className="tag" style={{ background: "rgba(245,158,11,0.1)", color: "var(--yellow)" }}>{p.style}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace" }}>Used: {p.times_used}x</span>
          <button onClick={() => onCopy(p)} className="btn btn-secondary btn-sm">📋 Copy</button>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{p.prompt}</p>
      <div style={{ marginTop: 10, fontSize: 11, color: "var(--dim)" }}>
        by{" "}
        <Link href={`/producer/${p.profiles?.username}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
          @{p.profiles?.username}
        </Link>
      </div>
    </div>
  );
}

export default function PromptsClient({ initialPrompts, userId }) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ genre: "", style: "", mood: "", prompt: "" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const handleCopy = async (p) => {
    await navigator.clipboard.writeText(p.prompt);
    showToast("Prompt copied! 🎹");
    const supabase = createClient();
    await supabase.from("suno_prompts").update({ times_used: p.times_used + 1 }).eq("id", p.id);
    setPrompts(prev => prev.map(pr => pr.id === p.id ? { ...pr, times_used: pr.times_used + 1 } : pr));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.prompt.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data: newP } = await supabase
      .from("suno_prompts")
      .insert({ ...form, user_id: userId, is_public: true, times_used: 0 })
      .select("*, profiles(username)")
      .single();
    if (newP) { setPrompts(prev => [newP, ...prev]); setModal(false); setForm({ genre: "", style: "", mood: "", prompt: "" }); }
    setLoading(false);
  };

  const filtered = prompts.filter(p =>
    !search || p.prompt.toLowerCase().includes(search.toLowerCase()) || p.genre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Suno Prompt Bank</h1>
          <p style={{ fontSize: 13, color: "var(--text2)" }}>{prompts.length} community prompts • sorted by most used</p>
        </div>
        <button onClick={() => setModal(true)} className="btn btn-primary btn-sm">+ Share Prompt</button>
      </div>

      <div className="search-wrap" style={{ marginBottom: 20 }}>
        <span className="search-icon">🔍</span>
        <input type="text" className="field-input" style={{ paddingLeft: 36 }} placeholder="Search prompts…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🤖</div><div className="empty-title">No prompts found</div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(p => <PromptCard key={p.id} p={p} onCopy={handleCopy} />)}
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Share a Suno Prompt</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid-3">
                <div>
                  <label className="field-label">GENRE</label>
                  <select className="field-input" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}>
                    <option value="">Select…</option>
                    {GENRES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">STYLE</label>
                  <select className="field-input" value={form.style} onChange={e => setForm({...form, style: e.target.value})}>
                    <option value="">Select…</option>
                    {STYLES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">MOOD</label>
                  <select className="field-input" value={form.mood} onChange={e => setForm({...form, mood: e.target.value})}>
                    <option value="">Select…</option>
                    {MOODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">SUNO PROMPT *</label>
                <textarea className="field-input" value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} placeholder="Paste your full Suno prompt here…" rows={5} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Sharing…" : "Share with Community"}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
