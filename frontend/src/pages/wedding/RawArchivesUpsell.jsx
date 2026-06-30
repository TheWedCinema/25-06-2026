import { Sparkles, Lock, ArrowRight } from "lucide-react";

const PRICE_USD = 499;

export default function RawArchivesUpsell({ onUnlock }) {
  return (
    <section className="py-12" data-testid="raw-archives-upsell">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6">Extended Storage &amp; Raw Media Archives</p>
        <div className="relative overflow-hidden rounded-md border border-[#D4AF37]/30 bg-gradient-to-br from-[#1a1410] via-black to-black">
          <div className="absolute inset-0 opacity-30">
            <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          </div>
          <div className="relative p-8 md:p-14 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <span className="inline-flex items-center gap-2 font-sans-twc text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-1 rounded-sm">
                <Lock size={11} /> Premium Add-on
              </span>
              <h3 className="font-serif-twc text-4xl md:text-5xl text-[#FDFBF7] tracking-tight leading-[0.95] mt-4">
                Unlock the<br /><span className="italic text-[#D4AF37]">raw masters.</span>
              </h3>
              <p className="font-sans-twc text-sm md:text-base text-zinc-300 leading-relaxed mt-5 max-w-xl">
                High-bitrate direct ingestion source streams — your full uncompressed 4K masters, 10-bit Dolby Vision, every camera angle, every raw take. Reserved for clients who want the original cinematic source.
              </p>
              <ul className="mt-5 grid sm:grid-cols-2 gap-y-2 gap-x-6 font-sans-twc text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                <li>10-bit Dolby Vision masters</li>
                <li>ProRes 422 HQ source</li>
                <li>Drone &amp; B-roll raw library</li>
                <li>Lifetime cloud locker</li>
              </ul>
            </div>
            <div className="md:col-span-5 text-center md:text-right">
              <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500">One-time unlock</p>
              <p className="font-serif-twc text-6xl md:text-7xl text-[#FDFBF7] tracking-tighter mt-2" data-testid="raw-archives-price">${PRICE_USD}</p>
              <button onClick={onUnlock} className="mt-6 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-sans-twc font-medium px-7 py-4 rounded-sm tracking-wide transition-colors inline-flex items-center gap-2" data-testid="raw-archives-unlock">
                <Sparkles size={16} /> Unlock Raw Delivery <ArrowRight size={16} />
              </button>
              <p className="mt-3 font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-600">Secure checkout · Studio-approved</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
