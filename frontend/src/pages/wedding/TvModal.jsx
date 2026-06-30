import { useState } from "react";
import { Tv } from "lucide-react";
import { TV_CODE_MIN, TV_CODE_RANGE } from "@/constants/timings";

const genPairingCode = () => Math.floor(TV_CODE_MIN + Math.random() * TV_CODE_RANGE).toString();

export default function TvModal({ open, onClose }) {
  const [code] = useState(genPairingCode);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" data-testid="tv-modal">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-md p-8 md:p-12 text-center">
        <button onClick={onClose} className="absolute top-4 right-5 text-zinc-500 hover:text-white text-2xl" data-testid="tv-close">×</button>
        <Tv size={28} className="text-[#D4AF37] mx-auto mb-6" strokeWidth={1.4} />
        <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Watch on TV</p>
        <h3 className="font-serif-twc text-4xl text-[#FDFBF7] tracking-tight">Connect your phone<br /><span className="italic text-zinc-400">to your Smart TV.</span></h3>
        <p className="font-sans-twc text-sm text-zinc-400 mt-6">Open <span className="text-[#FDFBF7]">watch.wedcinema.com</span> on your TV browser and enter:</p>
        <div className="mt-6 border border-[#D4AF37]/40 bg-[#1a1410] rounded-sm py-6 px-4">
          <p className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-[0.18em]" data-testid="tv-code">{code}</p>
        </div>
        <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500 mt-8">— Or cast directly —</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["Chromecast", "AirPlay", "Apple TV"].map((c) => (
            <button key={c} className="border border-white/15 hover:bg-white/10 text-zinc-300 font-sans-twc text-[11px] uppercase tracking-[0.22em] px-4 py-2 rounded-sm transition" data-testid={`cast-${c.toLowerCase().replace(/\s+/g, '-')}`}>{c}</button>
          ))}
        </div>
        <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-600 mt-8">Your phone becomes the remote · Swipe horizontal: seek · Swipe vertical: volume</p>
      </div>
    </div>
  );
}
