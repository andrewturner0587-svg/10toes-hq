import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <section className="hero">
        <div>
          <div className="hero-badge">🎹 EXCLUSIVE PRODUCER COMMUNITY</div>
          <h1 className="hero-title">
            Built for producers<br />
            <span>who go 10 Toes</span>
          </h1>
          <p className="hero-sub">
            The private platform where type beat producers track catalogs, discover winning niches,
            and share Suno prompts that actually convert.
          </p>
          <div className="hero-cta">
            <Link href="/login" className="btn btn-primary" style={{ fontSize: 15, padding: "13px 30px" }}>
              Get Access — $7.99/mo
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ fontSize: 15, padding: "13px 30px" }}>
              Sign In
            </Link>
          </div>

          <div className="price-card">
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "center" }}>
              <span className="price-amount">$7.99</span>
              <span className="price-period">/month</span>
            </div>
            <ul className="feature-list" style={{ marginTop: 28 }}>
              <li>Live community beat feed</li>
              <li>Full niche intelligence map</li>
              <li>Community Suno prompt bank</li>
              <li>Producer profiles + leaderboard</li>
              <li>Heart reactions + comments</li>
              <li>Personal beat catalog dashboard</li>
              <li>YouTube beat embed previews</li>
              <li>Cancel anytime</li>
            </ul>
            <Link href="/login" className="btn btn-primary" style={{ width: "100%", marginTop: 28, fontSize: 15, padding: 14 }}>
              Start Your 10 Toes Journey
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
