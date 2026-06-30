import { MessageCircle, Phone } from "lucide-react";

export default function StudioCard({ wedding }) {
  return (
    <section className="py-16 border-t border-white/5" data-testid="studio-card">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">{wedding.studio_tagline}</p>
          <div className="flex items-baseline gap-4">
            <span className="font-serif-twc text-6xl text-[#D4AF37]">{wedding.studio_initials}</span>
            <p className="font-serif-twc text-3xl text-[#FDFBF7]">{wedding.studio}</p>
          </div>
          <p className="font-sans-twc text-zinc-400 leading-relaxed mt-5 max-w-md">Capturing moments that turn into lifelong memories. Powered by cutting-edge cinema tech.</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <button className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc text-xs uppercase tracking-[0.22em] px-5 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="studio-chat">
            <MessageCircle size={14} /> Chat with us
          </button>
          <a href="tel:+919876543210" className="border border-white/20 hover:bg-white/10 text-white font-sans-twc text-xs uppercase tracking-[0.22em] px-5 py-3 rounded-sm transition inline-flex items-center gap-2" data-testid="studio-call">
            <Phone size={14} /> Call Studio
          </a>
        </div>
      </div>
    </section>
  );
}
