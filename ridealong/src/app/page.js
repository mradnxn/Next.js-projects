import Link from "next/link";
import Image from "next/image";
import LandingSmoothLink from "@/components/LandingSmoothLink";

export const metadata = {
  title: "RideAlong | Smarter Commutes. Shared Journeys. Zero Detours.",
  description:
    "The ultimate AI-powered carpooling network. Save costs, reduce carbon footprint, and enjoy premium commutes with real-time geospatial route matching.",
};

export default function LandingPage() {
  return (
    <>
      {/* Google Fonts: Space Grotesk + Inter */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        body { background: linear-gradient(135deg, #0f172a, #0c1a3a, #0f172a); color: #e2e8f0; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        .headline-font { font-family: 'Space Grotesk', sans-serif; }
        .glass-panel {
          background: rgba(15, 23, 42, 0.80);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(71, 85, 105, 0.5);
        }
        .neon-glow { box-shadow: 0 0 20px rgba(249,115,22,0.2); }
        .kinetic-gradient { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
        .map-mesh {
          background-image: radial-gradient(circle at 2px 2px, rgba(59,130,246,0.07) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          font-variation-settings: 'FILL' 1;
        }
      `}</style>

      {/* ── TOP NAV ── */}
      <header className="fixed top-4 left-0 right-0 z-50">
        <nav
          className="mt-4 mx-auto max-w-7xl border border-white/10 shadow-[0_24px_48px_-12px_rgba(7,13,31,0.5)] flex justify-between items-center w-[95%] px-8 py-3 rounded-full"
          style={{ background: "rgba(2,6,23,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-3xl">directions_car</span>
            <span className="text-2xl font-bold text-slate-50 tracking-tight italic headline-font">
              Ride<span className="text-orange-500">Along</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <LandingSmoothLink targetId="how-it-works" className="text-slate-400 font-medium hover:text-slate-100 transition-all duration-300">How It Works</LandingSmoothLink>
            <LandingSmoothLink targetId="safety" className="text-slate-400 font-medium hover:text-slate-100 transition-all duration-300">Safety</LandingSmoothLink>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-400 font-medium hover:text-slate-100 transition-colors px-4 py-2">
              Log In
            </Link>
            <Link
              href="/signup"
              className="kinetic-gradient font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform active:scale-95 text-[#511f00]"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">

        {/* ── HERO SECTION ── */}
        <section className="relative min-h-screen flex items-center pt-36 overflow-hidden">
          {/* Map mesh bg */}
          <div className="absolute inset-0 z-0 opacity-40 map-mesh" />
          {/* Glow blobs — match dashboard's orange/blue orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
            {/* Left: Text */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 border border-white/10 px-4 py-1.5 rounded-full mb-8 w-fit" style={{ background: "#0c1326" }}>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Live AI-Matching Active</span>
              </div>

              <h1 className="headline-font text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 text-slate-50">
                Smarter Commutes.<br />
                <span className="text-orange-500 italic">Shared Journeys.</span><br />
                Zero Detours.
              </h1>

              <p className="text-xl text-slate-400 max-w-xl mb-12 leading-relaxed">
                The ultimate high-performance carpooling network. Save costs, reduce carbon footprint, and enjoy a premium commute with our AI-driven route optimization.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="kinetic-gradient font-bold px-10 py-5 rounded-full text-lg shadow-xl hover:scale-105 transition-all active:scale-95 text-[#511f00]"
                  style={{ boxShadow: "0 20px 40px rgba(255,145,83,0.2)" }}
                >
                  Find a Ride
                </Link>
                <Link
                  href="/signup"
                  className="bg-transparent border border-white/20 text-blue-400 font-bold px-10 py-5 rounded-full text-lg hover:bg-white/5 transition-all"
                >
                  Offer a Ride
                </Link>
              </div>
            </div>

            {/* Right: Glass HUD card — uses project slate-900 glass style */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-md">
                <div className="absolute inset-0 rounded-full blur-3xl bg-orange-500/10 pointer-events-none" />
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 w-full h-full rounded-3xl relative overflow-hidden p-6 flex flex-col gap-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-orange-500">Live HUD</span>
                    <span className="material-symbols-outlined text-blue-400">radar</span>
                  </div>

                  {/* Mock rider card */}
                  <div className="rounded-xl p-4 border border-slate-700/50 bg-slate-800/50">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center border border-orange-500/30 bg-slate-800">
                        <span className="material-symbols-outlined text-orange-500">person</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-24 rounded-full mb-2 bg-slate-700" />
                        <div className="h-1.5 w-16 rounded-full bg-slate-800" />
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 font-bold text-sm">ETA 8m</div>
                      </div>
                    </div>
                  </div>

                  {/* Stitch map image */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfSmHp-pgYuOdyi7oljB8f_0AonLWn_l21m1C-9u2UZrJilioQtPO3kKRiFTNvfklFB-N2XwTPSi6hCfcxJF13ZWP46vuMnO5-9Yrto1-bEBvMmqV5J2MDOZpXkzYjsZAtWC3Uamlmr24lZdbgl9e-f5B9qs5MGfhbqUZpfUuQBo4cWCgDYnZL0QCltO8uvGK4s5anF4cP0X1W_rxbBnHu0mVVoNbd3BbvV4cjFUhp8ETSAx-aNs4A0nuV0Kvezv0kMufrGcL39Yvy"
                    alt="Futuristic map visualization with glowing route lines"
                    className="w-full h-48 object-cover rounded-xl mt-4 opacity-80 mix-blend-lighten"
                  />

                  {/* Route optimization bar */}
                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Route Optimization</span>
                      <span>98% Accuracy</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800">
                      <div className="h-full kinetic-gradient w-[98%]" style={{ boxShadow: "0 0 10px #f97316" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-20">
              <h2 className="headline-font text-4xl md:text-5xl font-bold mb-4 text-slate-50">
                Engineered for <span className="text-orange-500">Simplicity</span>
              </h2>
              <p className="text-slate-400 max-w-2xl">Three high-velocity steps to transform your daily commute from a chore into a seamless experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="glass-panel p-8 rounded-3xl flex flex-col group hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-orange-500/20 group-hover:bg-orange-500 transition-colors" style={{ background: "rgba(255,145,83,0.10)" }}>
                  <span className="material-symbols-outlined text-3xl text-orange-500 group-hover:text-[#511f00]">map</span>
                </div>
                <h3 className="headline-font text-2xl font-bold mb-4 text-slate-50">Publish Your Route</h3>
                <p className="text-slate-400 leading-relaxed">Input your destination and schedule. Our engine maps your optimal trajectory instantly.</p>
                <Link href="/signup" className="mt-12 flex items-center gap-2 text-orange-500 font-bold text-sm group-hover:gap-4 transition-all">
                  GET STARTED <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {/* Step 2 */}
              <div className="glass-panel p-8 rounded-3xl flex flex-col group hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-blue-400/20 group-hover:bg-blue-500 transition-colors" style={{ background: "rgba(105,156,255,0.10)" }}>
                  <span className="material-symbols-outlined text-3xl text-blue-400 group-hover:text-white">memory</span>
                </div>
                <h3 className="headline-font text-2xl font-bold mb-4 text-slate-50">Seamless Intersection</h3>
                <p className="text-slate-400 leading-relaxed">AI matches you with compatible riders on your path. No detours, just shared speed.</p>
                <LandingSmoothLink targetId="how-it-works" className="mt-12 flex items-center gap-2 text-blue-400 font-bold text-sm group-hover:gap-4 transition-all">
                  HOW IT WORKS <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </LandingSmoothLink>
              </div>

              {/* Step 3 */}
              <div className="glass-panel p-8 rounded-3xl flex flex-col group hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-yellow-400/20 group-hover:bg-yellow-400 transition-colors" style={{ background: "rgba(254,187,40,0.10)" }}>
                  <span className="material-symbols-outlined text-3xl text-yellow-400 group-hover:text-[#3c2900]">track_changes</span>
                </div>
                <h3 className="headline-font text-2xl font-bold mb-4 text-slate-50">Real-Time Tracking</h3>
                <p className="text-slate-400 leading-relaxed">Monitor every turn with geospatial precision. Secure, transparent, and live.</p>
                <LandingSmoothLink targetId="safety" className="mt-12 flex items-center gap-2 text-yellow-400 font-bold text-sm group-hover:gap-4 transition-all">
                  VIEW SECURITY <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </LandingSmoothLink>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST & SAFETY ── */}
        <section id="safety" className="py-24 border-y border-slate-700/30 bg-slate-900/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              {/* Left: Text */}
              <div>
                <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4 block">Safety First Architecture</span>
                <h2 className="headline-font text-4xl md:text-5xl font-bold mb-8 text-slate-50">
                  Verification at the <span className="text-blue-400">Core</span>.
                </h2>

                <div className="space-y-8">
                  {[
                    { icon: "verified_user", title: "Government RC Verification via AI", desc: "Instant authentication of vehicle documents and identity papers using advanced computer vision." },
                    { icon: "location_on", title: "Live Geospatial Trip Tracking", desc: "Share your live location with trusted contacts throughout the duration of your commute." },
                    { icon: "star", title: "Mutual Rating Systems", desc: "A bilateral feedback loop ensuring professional conduct and community excellence." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border border-blue-400/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-400">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2 text-slate-100">{item.title}</h4>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Image */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-[40px] blur-2xl" style={{ background: "rgba(105,156,255,0.20)" }} />
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtxJaWLWwAxo9SNJd4u6yd8CYjdMoc6yDJ9tkecJmMw1zufWV7XAfO8DUvrOKrpbf2enQAw3kxMOQ586Hn_ohv17KWH3xS5_ACOdXjgKjweTXaovKsC2xe2LyQ1k_X1nqs0u9zRs1vplUZbmEnM5uDev8xlFr_JjGpMmVE7PsF9vGG-KAILsZ-iXPaygSTgqqnZJGaAeNjsHkd57XoZcmfWnu6m75yLW0l17CgUB5JTiXuY_tDbs2cqaX0n6osABihc0XFzeDosH0V"
                  alt="Modern car interior at night with minimalist dashboard lighting"
                  className="relative z-10 w-full rounded-[32px] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="py-32 relative overflow-hidden">
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20 pointer-events-none">
            <div className="w-full h-full" style={{ background: "radial-gradient(circle at center, rgba(255,145,83,0.30), transparent 70%)" }} />
          </div>

          <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
            <h2 className="headline-font text-5xl md:text-7xl font-bold mb-8 text-slate-50">
              Ready to <span className="text-orange-500">Accelerate</span>?
            </h2>
            <p className="text-xl text-slate-400 mb-12">Join thousands of daily commuters reclaiming their time and money.</p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <Link
                href="/login"
                className="kinetic-gradient font-black px-12 py-6 rounded-full text-xl hover:scale-105 transition-all text-[#511f00]"
              >
                Explore Routes
              </Link>
              <Link
                href="/signup"
                className="glass-panel text-slate-100 font-bold px-12 py-6 rounded-full text-xl hover:bg-white/10 transition-all"
              >
                Join as a Driver
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-700/30 mt-20 bg-slate-900/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-10 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-lg font-black text-slate-200 flex items-center gap-2 headline-font">
              <span className="material-symbols-outlined text-orange-500">directions_car</span>
              Ride<span className="text-orange-500">Along</span>
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mt-2">Kinetic Mobility Systems</p>
          </div>

          <div className="flex gap-8 mb-8 md:mb-0">
            <Link href="/privacy" className="text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors">Terms</Link>
            <LandingSmoothLink targetId="safety" className="text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors">Safety</LandingSmoothLink>
            <Link href="/contact" className="text-xs font-medium uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors">Contact</Link>
          </div>

          <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
            © 2026 RideAlong. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
