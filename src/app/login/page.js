"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Always use the live production URL for auth callbacks so magic links work
  // regardless of whether the email was sent from localhost or the live site
  const PROD_URL = "https://10toes-hq.vercel.app";

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${PROD_URL}/auth/callback` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%), var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="logo" style={{ fontSize: 26, display: "block", marginBottom: 6 }}>10TOES HQ</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--dim)", letterSpacing: 3 }}>TYPE BEATS COMMAND CENTER</div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Check your inbox</h2>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>
                Magic link sent to <strong>{email}</strong>.<br />
                Click the link to sign in — no password needed.
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Sign In</h1>
              <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 24 }}>
                Enter your email and we&apos;ll send a magic link.
              </p>

              <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="field-label">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className="field-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="producer@email.com"
                    required
                  />
                </div>
                {error && <p style={{ fontSize: 12, color: "var(--red)" }}>{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: 12 }}>
                  {loading ? "Sending…" : "Send Magic Link ✉️"}
                </button>
              </form>


              <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--dim)" }}>
                New here? Signing in will start your setup.
              </p>

            </>
          )}
        </div>
      </div>
    </main>
  );
}
