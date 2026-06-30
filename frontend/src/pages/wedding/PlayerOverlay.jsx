import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, X, Settings } from "lucide-react";
import { OVERLAY_FADE } from "@/constants/motion";

const QUALITIES = ["Auto / 4K", "2K HD", "1080p", "720p"];

export default function PlayerOverlay({ src, title, onClose }) {
  const videoRef = useRef(null);
  const [quality, setQuality] = useState(QUALITIES[0]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  return (
    <motion.div
      {...OVERLAY_FADE}
      className="fixed inset-0 z-[80] bg-black"
      data-testid="player-overlay"
    >
      <div className="absolute top-5 left-6 right-6 z-10 flex items-center justify-between">
        <button onClick={onClose} className="text-zinc-300 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em]" data-testid="player-close">
          <ArrowLeft size={16} /> Back
        </button>
        <p className="font-sans-twc text-xs uppercase tracking-[0.3em] text-zinc-400" data-testid="player-title">{title}</p>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="text-zinc-300 hover:text-white inline-flex items-center gap-2 font-sans-twc text-xs uppercase tracking-[0.22em]" data-testid="player-quality">
              <Settings size={14} /> {quality}
            </button>
            <div className="absolute right-0 top-full mt-2 bg-black/90 backdrop-blur border border-white/10 rounded-sm py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all min-w-[140px]">
              {QUALITIES.map((q) => (
                <button key={q} onClick={() => setQuality(q)} className={`block w-full text-left px-4 py-2 text-xs font-sans-twc uppercase tracking-[0.18em] ${q === quality ? "text-[#D4AF37]" : "text-zinc-300 hover:text-white"}`} data-testid={`quality-${q.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-300 hover:text-white" data-testid="player-x"><X size={20} /></button>
        </div>
      </div>
      <video ref={videoRef} src={src} autoPlay controls playsInline className="w-full h-full object-contain bg-black" data-testid="player-video" />
    </motion.div>
  );
}
