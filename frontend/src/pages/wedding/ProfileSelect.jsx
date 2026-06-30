import { motion } from "framer-motion";
import { PROFILE_TILE } from "@/constants/motion";

export default function ProfileSelect({ wedding, onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" data-testid="profile-select">
      <p className="font-sans-twc text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mb-4">{wedding.studio_initials} {wedding.studio}</p>
      <h1 className="font-serif-twc text-5xl md:text-6xl text-[#FDFBF7] tracking-tight">Who&apos;s watching?</h1>
      <div className="mt-16 flex flex-wrap items-start justify-center gap-10 md:gap-16">
        {wedding.profiles.map((p, i) => (
          <motion.button
            key={p.id}
            {...PROFILE_TILE(i * 0.1)}
            onClick={() => onSelect(p)}
            className="group text-center"
            data-testid={`profile-${p.id}`}
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-md overflow-hidden border border-white/10 group-hover:border-[#D4AF37] transition-colors duration-300">
              <img src={p.avatar} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="font-sans-twc text-sm text-zinc-400 group-hover:text-white mt-4 tracking-wide transition-colors">{p.name}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
