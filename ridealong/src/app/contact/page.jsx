import Link from "next/link";

export const metadata = { title: "Contact | RideAlong" };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#070d1f] text-slate-300 px-6 py-20 max-w-3xl mx-auto">
      <Link href="/" className="text-xs text-slate-500 hover:text-orange-400 uppercase tracking-widest transition-colors">← Back to Home</Link>
      <h1 className="text-4xl font-bold text-slate-50 mt-8 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Contact Us</h1>
      <p className="text-slate-500 text-sm mb-12">We&apos;re here to help.</p>
      <div className="space-y-6 text-sm">
        {[
          { label: "General Inquiries", value: "hello@ridealong.app" },
          { label: "Safety & Reports", value: "safety@ridealong.app" },
          { label: "Privacy Requests", value: "privacy@ridealong.app" },
          { label: "Driver Support", value: "drivers@ridealong.app" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 border-b border-white/5">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 sm:w-48">{label}</span>
            <a href={`mailto:${value}`} className="text-orange-400 hover:text-orange-300 transition-colors font-medium">{value}</a>
          </div>
        ))}
      </div>
      <p className="text-slate-500 text-xs mt-12">Response time: within 48 hours on business days.</p>
    </div>
  );
}
