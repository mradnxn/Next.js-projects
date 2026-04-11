import Link from "next/link";

export const metadata = { title: "Privacy Policy | RideAlong" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070d1f] text-slate-300 px-6 py-20 max-w-3xl mx-auto">
      <Link href="/" className="text-xs text-slate-500 hover:text-orange-400 uppercase tracking-widest transition-colors">← Back to Home</Link>
      <h1 className="text-4xl font-bold text-slate-50 mt-8 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Privacy Policy</h1>
      <p className="text-slate-500 text-sm mb-12">Last updated: March 2026</p>
      <div className="space-y-8 text-sm leading-relaxed">
        {[
          { title: "Information We Collect", body: "We collect information you provide directly (name, email, gender), location data during active trips, and usage analytics to improve the platform." },
          { title: "How We Use Your Data", body: "Your data is used exclusively to match riders with drivers, verify vehicle registrations via AI, and ensure trip safety. We never sell your data to third parties." },
          { title: "Location Data", body: "Live location is only tracked during active trip sessions. All geospatial data is encrypted in transit and automatically purged after 30 days." },
          { title: "Vehicle Verification", body: "Registration certificate images uploaded for driver verification are processed by our AI system and stored securely. They are not shared with any external parties." },
          { title: "Your Rights", body: "You may request deletion of your account and all associated data at any time from your Profile Settings. Data deletion is permanent and completed within 72 hours." },
          { title: "Contact", body: "For privacy concerns, contact us at privacy@ridealong.app" },
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
