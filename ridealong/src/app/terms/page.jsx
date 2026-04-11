import Link from "next/link";

export const metadata = { title: "Terms of Service | RideAlong" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070d1f] text-slate-300 px-6 py-20 max-w-3xl mx-auto">
      <Link href="/" className="text-xs text-slate-500 hover:text-orange-400 uppercase tracking-widest transition-colors">← Back to Home</Link>
      <h1 className="text-4xl font-bold text-slate-50 mt-8 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Terms of Service</h1>
      <p className="text-slate-500 text-sm mb-12">Last updated: March 2026</p>
      <div className="space-y-8 text-sm leading-relaxed">
        {[
          { title: "Acceptance of Terms", body: "By using RideAlong, you agree to these terms. If you disagree, please discontinue use of the platform immediately." },
          { title: "Driver Responsibilities", body: "Drivers must maintain a valid license, verified vehicle registration, and act professionally at all times. Fraud, impersonation, or vehicle misrepresentation will result in permanent account suspension." },
          { title: "Rider Responsibilities", body: "Riders must provide accurate pickup locations and treat drivers with respect. Cancellations made repeatedly or in bad faith may result in account restrictions." },
          { title: "Safety Standards", body: "RideAlong is a peer-to-peer mobility platform. Users are independently responsible for their safety. We provide AI verification tools and mutual rating systems, but cannot guarantee the conduct of any user." },
          { title: "Pricing & Payments", body: "Prices are dynamically calculated based on route distance and seat usage. All transactions are handled between riders and drivers directly. RideAlong does not process payments." },
          { title: "Termination", body: "We reserve the right to suspend or permanently terminate accounts that violate these terms, threaten platform integrity, or receive consistent negative safety reports." },
        ].map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-white font-bold mb-2">{title}</h2>
            <p className="text-slate-400">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
