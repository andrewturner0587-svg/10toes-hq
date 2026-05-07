"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Something went wrong.");
    } catch {
      setError("Unable to start checkout. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 60%), var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{ marginBottom: 32 }}>
          <div className="logo" style={{ fontSize: 24, display: "block", marginBottom: 8 }}>10TOES HQ</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Get Full Access</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Join the community of producers going 10 Toes.</p>
        </div>

        <div className="price-card" style={{ margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "center", marginBottom: 24 }}>
            <span className="price-amount">$7.99</span>
            <span className="price-period">/month</span>
          </div>

          <ul className="feature-list">
            <li>Community beat feed (realtime)</li>
            <li>Full niche intelligence map</li>
            <li>Suno prompt community bank</li>
            <li>Producer profiles + leaderboard</li>
            <li>Heart reactions &amp; comments</li>
            <li>YouTube beat embed previews</li>
            <li>Personal beat catalog tracker</li>
            <li>Cancel anytime — no contracts</li>
          </ul>

          {error && (
            <p style={{ fontSize: 12, color: "var(--red)", margin: "16px 0 0", textAlign: "center" }}>{error}</p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 24, padding: "15px 0", fontSize: 15 }}
          >
            {loading ? "Redirecting to checkout…" : "Subscribe — $7.99/mo 🔐"}
          </button>

          <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 14, lineHeight: 1.5 }}>
            Secure checkout powered by Stripe. Cancel anytime from your settings.
          </p>
        </div>
      </div>
    </main>
  );
}
