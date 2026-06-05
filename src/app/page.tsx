import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4" style={{ background: "rgba(6,8,15,0.8)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="container-wide flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>A</div>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--text-primary)" }}>AdmitScore</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/requirements" className="text-sm no-underline hidden sm:inline-block" style={{ color: "var(--text-secondary)" }}>Browse Programs</Link>
            <Link href="/calculate" className="btn-primary !py-2.5 !px-5 !text-sm">Check My APS</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute bottom-10 right-1/4 w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />

        <div className="container-wide text-center relative z-10">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#3b82f6" }} />
              Free for every South African student
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", animationDelay: "0.1s", opacity: 0 }}>
            Know Where You
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981)" }}>
              Stand. Instantly.
            </span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ color: "var(--text-secondary)", animationDelay: "0.2s", opacity: 0 }}>
            Enter your matric marks. Get matched to 70+ programs across South Africa&apos;s top universities. No sign-up. No fees. No nonsense.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
            <Link href="/calculate" className="btn-primary !text-lg !px-10 !py-4 no-underline w-full sm:w-auto">
              Calculate My APS
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/requirements" className="btn-secondary !text-base !px-8 !py-4 no-underline w-full sm:w-auto">Browse Requirements</Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
              Three steps. Zero stress.
            </h2>
            <p style={{ color: "var(--text-secondary)" }} className="text-lg">From marks to matches in under 60 seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {[
              { step: "01", icon: "✏️", title: "Enter Your Marks", desc: "Type in your matric subjects and percentages. Our smart numpad keeps it fast." },
              { step: "02", icon: "⚡", title: "Get Instant Matches", desc: "Our engine checks you against 70+ programs and sorts results by eligibility." },
              { step: "03", icon: "🎯", title: "Know Your Options", desc: "See Safe Bets, Exact Matches, and what to improve for Near Misses." },
            ].map((item) => (
              <div key={item.step} className="glass-card p-8 text-center group">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold mb-2 tracking-widest" style={{ color: "var(--accent-blue)" }}>{item.step}</div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>{item.title}</h3>
                <p style={{ color: "var(--text-secondary)" }} className="text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Universities ────────────────────────────────── */}
      <section className="py-16 sm:py-20" style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container-wide">
          <p className="text-center text-sm font-medium mb-8 tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
            Covering South Africa&apos;s Top Universities
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {["UCT", "Wits", "UP", "UJ", "Stellenbosch"].map((uni) => (
              <div key={uni} className="text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-200 cursor-default" style={{ color: "var(--text-muted)", fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "70+", label: "Programs" },
              { value: "5", label: "Universities" },
              { value: "100%", label: "Free" },
              { value: "<2s", label: "Match Speed" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card-static p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')", color: "var(--accent-blue)" }}>
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="container-app">
          <div className="glass-card p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.15), transparent 70%)" }} />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading, 'Space Grotesk')" }}>
                Ready to find your future?
              </h2>
              <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
                It takes less than a minute. No sign-up required.
              </p>
              <Link href="/calculate" className="btn-primary !text-lg !px-10 !py-4 no-underline">
                Start Now — It&apos;s Free
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="py-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-xs" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>A</div>
            <span className="text-sm font-semibold">AdmitScore</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} AdmitScore. Free for every South African student. Not affiliated with any university.
          </p>
        </div>
      </footer>
    </main>
  );
}
