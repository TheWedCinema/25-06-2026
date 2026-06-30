function Stat({ label, value, sub, icon: Icon }) {
  return (
    <div className="border border-white/10 rounded-md p-6 bg-white/[0.02] hover:border-white/20 transition" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] text-zinc-500">{label}</p>
        {Icon && <Icon size={16} className="text-[#D4AF37]" strokeWidth={1.6} />}
      </div>
      <p className="font-serif-twc text-4xl text-[#FDFBF7] tracking-tight">{value}</p>
      {sub && <p className="font-sans-twc text-xs text-zinc-500 mt-2">{sub}</p>}
    </div>
  );
}

function HlsTarget({ res, status }) {
  const tone = {
    done:    { label: "Done",    cls: "text-[#D4AF37] border-[#D4AF37]/40 bg-[#1a1410]" },
    running: { label: "Encoding", cls: "text-[#FDFBF7] border-white/30 bg-white/5 animate-pulse" },
    pending: { label: "Pending", cls: "text-zinc-500 border-white/10 bg-transparent" },
  }[status] || { label: status, cls: "text-zinc-400 border-white/10" };
  return (
    <div className={`rounded-sm p-4 border ${tone.cls}`} data-testid={`hls-${res.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="font-serif-twc text-2xl text-[#FDFBF7]">{res}</p>
      <p className="font-sans-twc text-[10px] uppercase tracking-[0.28em] mt-2">{tone.label}</p>
    </div>
  );
}

export { Stat, HlsTarget };
