"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim().toLowerCase())
      .single();

    if (existing) {
      setError("That username is taken. Try another.");
      setLoading(false);
      return;
    }

    const { error: err } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
    });

    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/subscribe");
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎹</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Set Up Your Profile</h1>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>This is how other producers will know you.</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="field-label">PRODUCER HANDLE *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--dim)", fontSize: 13 }}>@</span>
                <input
                  type="text"
                  className="field-input"
                  style={{ paddingLeft: 26 }}
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, ""))}
                  placeholder="10toes"
                  maxLength={24}
                  required
                />
              </div>
              <p style={{ fontSize: 10, color: "var(--dim)", marginTop: 4, fontFamily: "var(--mono)" }}>
                Letters, numbers, underscores only. No spaces.
              </p>
            </div>

            <div>
              <label className="field-label">BIO (OPTIONAL)</label>
              <textarea
                className="field-input"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Trap producer, Gospel rap, ATL 🔥"
                maxLength={160}
                rows={3}
              />
            </div>

            {error && <p style={{ fontSize: 12, color: "var(--red)" }}>{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading || !username.trim()} style={{ width: "100%", padding: 13 }}>
              {loading ? "Saving…" : "Claim My Handle →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
