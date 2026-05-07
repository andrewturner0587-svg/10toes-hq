"use client";
import { useState } from "react";
import { TIERS, NICHE_DATA } from "@/lib/constants";

export default function NichesClient({ beats }) {
  const [filter, setFilter] = useState("all");

  // Count community beats per genre
  const genreCounts = beats.reduce((acc, b) => {
    if (b.genre) acc[b.genre] = (acc[b.genre] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Niche Intelligence Map</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>
          Beat market data + community activity. Find your sweet spot.
        </p>
      </div>

      {/* Trending genres from community */}
      {Object.keys(genreCounts).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>
            🔥 TRENDING IN COMMUNITY
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(genreCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([genre, count]) => (
              <div key={genre} style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", fontSize: 12, fontWeight: 600, color: "var(--accent)", display: "flex", gap: 6, alignItems: "center" }}>
                {genre}
                <span style={{ background: "rgba(139,92,246,0.2)", borderRadius: 10, padding: "1px 7px", fontSize: 10 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier Filter */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        {["all","1","2","3","4"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="pill" style={{ border: `1px solid ${filter===f ? (f==="all" ? "rgba(139,92,246,0.4)" : TIERS[f]?.color+"44") : "var(--border)"}`, background: filter===f ? (f==="all" ? "rgba(139,92,246,0.1)" : TIERS[f]?.bg) : "transparent", color: filter===f ? (f==="all" ? "var(--accent)" : TIERS[f]?.color) : "var(--dim)" }}>
            {f === "all" ? "All Tiers" : `${TIERS[f]?.label} — ${TIERS[f]?.sub}`}
          </button>
        ))}
      </div>

      {NICHE_DATA.map((cat, ci) => {
        const items = cat.items.filter(n => filter === "all" || n.t === filter);
        if (!items.length) return null;
        return (
          <div key={ci} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--dim)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 10 }}>
              {cat.cat.toUpperCase()}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((n, i) => {
                const tierStyle = TIERS[n.t];
                return (
                  <div key={i} className="card card-sm" style={{ borderLeft: `3px solid ${tierStyle?.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{n.title}</div>
                        <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>
                          Tags: {n.tags}
                        </div>
                        <div style={{ fontSize: 12, color: n.t === "3" ? "var(--green)" : n.t === "4" ? "var(--blue)" : "var(--text2)", fontWeight: n.t === "3" || n.t === "4" ? 600 : 400 }}>
                          {n.note}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, background: "var(--bg2)", color: n.vol==="Very High" ? "var(--red)" : n.vol==="High" ? "var(--yellow)" : n.vol==="Medium" ? "var(--green)" : "var(--blue)" }}>
                          VOL: {n.vol}
                        </span>
                        <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, background: "var(--bg2)", color: (n.comp==="Very High"||n.comp==="High") ? "var(--red)" : n.comp==="Very Low" ? "var(--green)" : n.comp==="Low" ? "#22c55e" : "var(--yellow)" }}>
                          COMP: {n.comp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
